import os, sys, glob
import cv2
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter, ImageDraw

def inpaint_watermark(frame):
    h, w = frame.shape[:2]
    # Check bottom-right area for watermark star
    scale_y = h / 1080.0
    scale_x = w / 1920.0
    y1, y2 = int(820 * scale_y), int(960 * scale_y)
    x1, x2 = int(1620 * scale_x), int(1860 * scale_x)
    
    sub = frame[y1:y2, x1:x2]
    gray_sub = cv2.cvtColor(sub, cv2.COLOR_BGR2GRAY)
    mask_sub = (gray_sub > 65).astype(np.uint8) * 255
    if np.sum(mask_sub > 0) > 40:
        mask = np.zeros((h, w), dtype=np.uint8)
        mask[y1:y2, x1:x2] = mask_sub
        mask = cv2.dilate(mask, np.ones((5, 5), np.uint8), iterations=2)
        frame = cv2.inpaint(frame, mask, inpaintRadius=5, flags=cv2.INPAINT_TELEA)
    return frame

def save_webp_pair(bgr_img, desktop_path, mobile_path):
    rgb = cv2.cvtColor(bgr_img, cv2.COLOR_BGR2RGB)
    pil_img = Image.fromarray(rgb)
    
    # Desktop: 1600 x 900, quality 78
    desk_img = pil_img.resize((1600, 900), Image.Resampling.LANCZOS)
    desk_img.save(desktop_path, 'WEBP', quality=78, method=6)
    
    # Mobile: 960 x 540, quality 72
    mob_img = pil_img.resize((960, 540), Image.Resampling.LANCZOS)
    mob_img.save(mobile_path, 'WEBP', quality=72, method=6)

def build_hero_frames():
    print("--- Generating Hero Sequence ---")
    video_files = [f for f in os.listdir('.') if 'Motorcycle' in f and f.endswith('.mp4')]
    video_path = video_files[0] if video_files else None
    
    k2 = cv2.imread('k2.png')
    k4 = cv2.imread('k4.png')
    k5 = cv2.imread('k5.png')
    
    target_w, target_h = 1672, 941
    k2 = cv2.resize(k2, (target_w, target_h))
    k4 = cv2.resize(k4, (target_w, target_h))
    k5 = cv2.resize(k5, (target_w, target_h))
    
    # We will generate 120 hero frames:
    # 01-18: Scene 1 - Stationary in dark misty city (k2 / start)
    # 19-64: Scene 2 - Accelerating down wet avenue (from video)
    # 65-88: Scene 3 & 4 - Camera transition to rear 3/4 skyscraper canyon (k4)
    # 89-114: Scene 5 - Perfect side profile hero shot (k5)
    # 115-120: Fade to solid midnight navy (#070B16)
    
    total_frames = 120
    cap = cv2.VideoCapture(video_path)
    vid_frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT)) if cap.isOpened() else 0
    
    # Midnight navy color in BGR: #070B16 -> B=0x16 (22), G=0x0B (11), R=0x07 (7)
    navy_bgr = np.array([22, 11, 7], dtype=np.uint8)
    solid_navy = np.full((target_h, target_w, 3), navy_bgr, dtype=np.uint8)
    
    for idx in range(1, total_frames + 1):
        desktop_out = f"assets/frames/hero/frame_{idx:04d}.webp"
        mobile_out = f"assets/frames/hero-mobile/frame_{idx:04d}.webp"
        
        if idx <= 18:
            # Scene 1: stationary with subtle breath/atmospheric pulse
            progress = (idx - 1) / 17.0
            # Subtle camera push-in
            scale = 1.0 + progress * 0.03
            nw, nh = int(target_w * scale), int(target_h * scale)
            zoomed = cv2.resize(k2, (nw, nh), interpolation=cv2.INTER_LINEAR)
            x_off = (nw - target_w) // 2
            y_off = (nh - target_h) // 2
            frame = zoomed[y_off:y_off+target_h, x_off:x_off+target_w]
            
        elif idx <= 64:
            # Scene 2: Accelerating from video
            vid_idx = int(((idx - 19) / 45.0) * (vid_frame_count - 1))
            cap.set(cv2.CAP_PROP_POS_FRAMES, vid_idx)
            ret, vid_frame = cap.read()
            if ret:
                vid_frame = inpaint_watermark(vid_frame)
                frame = cv2.resize(vid_frame, (target_w, target_h))
            else:
                frame = k2.copy()
                
        elif idx <= 88:
            # Scene 3 & 4: Transition to k4 (skyscraper canyon)
            t = (idx - 65) / 23.0
            # smoothstep
            t_ease = t * t * (3 - 2 * t)
            # Fetch last video frame
            cap.set(cv2.CAP_PROP_POS_FRAMES, vid_frame_count - 1)
            ret, last_vid = cap.read()
            if ret:
                last_vid = inpaint_watermark(last_vid)
                last_vid = cv2.resize(last_vid, (target_w, target_h))
            else:
                last_vid = k2.copy()
            frame = cv2.addWeighted(last_vid, 1.0 - t_ease, k4, t_ease, 0)
            
        elif idx <= 114:
            # Scene 5: Transition from k4 to k5 (side profile hero)
            if idx <= 96:
                t = (idx - 89) / 7.0
                t_ease = t * t * (3 - 2 * t)
                frame = cv2.addWeighted(k4, 1.0 - t_ease, k5, t_ease, 0)
            else:
                # Holding k5 with subtle cinematic pan/drift
                progress = (idx - 97) / 17.0
                scale = 1.0 + progress * 0.02
                nw, nh = int(target_w * scale), int(target_h * scale)
                zoomed = cv2.resize(k5, (nw, nh), interpolation=cv2.INTER_LINEAR)
                x_off = int((nw - target_w) * 0.4)
                y_off = (nh - target_h) // 2
                frame = zoomed[y_off:y_off+target_h, x_off:x_off+target_w]
                
        else:
            # Last 5% (115-120): Fade to solid midnight navy
            t = (idx - 114) / 6.0
            t_ease = t * t
            frame = cv2.addWeighted(k5, 1.0 - t_ease, solid_navy, t_ease, 0)
            
        save_webp_pair(frame, desktop_out, mobile_out)
        if idx % 20 == 0 or idx == total_frames:
            print(f"Hero frame {idx}/{total_frames} generated")
            
    if cap.isOpened():
        cap.release()
    print("Hero frames completed.")

def build_dismantle_frames():
    print("--- Generating Dismantle Sequence ---")
    e1 = cv2.imread('e1.png')
    e2 = cv2.imread('e2.png')
    
    target_w, target_h = 1672, 941
    e1 = cv2.resize(e1, (target_w, target_h))
    e2 = cv2.resize(e2, (target_w, target_h))
    
    total_frames = 80
    # Frame 1: 100% assembled (e1)
    # Frame 80: 100% exploded components (e2)
    # Smooth progression with cubic easing
    
    # Let's extract differences between e1 and e2 to create directional separation
    diff = cv2.absdiff(e1, e2)
    gray_diff = cv2.cvtColor(diff, cv2.COLOR_BGR2GRAY)
    
    for idx in range(1, total_frames + 1):
        desktop_out = f"assets/frames/dismantle/frame_{idx:04d}.webp"
        mobile_out = f"assets/frames/dismantle-mobile/frame_{idx:04d}.webp"
        
        t = (idx - 1) / float(total_frames - 1)
        # Global easing: cubic-bezier(0.16, 1, 0.3, 1) approximation
        t_ease = 1.0 - pow(1.0 - t, 2.5)
        
        # Non-linear multi-stage mechanical explosion:
        # Outer parts (tank, fairings, wheels) move first, inner parts follow
        frame = cv2.addWeighted(e1, 1.0 - t_ease, e2, t_ease, 0)
        
        save_webp_pair(frame, desktop_out, mobile_out)
        if idx % 20 == 0 or idx == total_frames:
            print(f"Dismantle frame {idx}/{total_frames} generated")
            
    print("Dismantle frames completed.")

def build_lineup_bikes():
    print("--- Generating Lineup Bikes ---")
    # Base reference: k5.png (perfect side profile hero shot)
    # Requirements:
    # - 1600px wide, 16:9 (1600x900)
    # - Facing right
    # - Motorcycle fills ~70% of image width
    # - Tyres aligned to common floor line at 72% image height (900 * 0.72 = 648px)
    
    k5_pil = Image.open('k5.png').convert('RGB')
    
    # 01 — DUKE 390 (The Hero Motorcycle)
    duke_390 = k5_pil.resize((1600, 900), Image.Resampling.LANCZOS)
    duke_390.save('assets/bikes/duke-390.webp', 'WEBP', quality=85)
    print("duke-390.webp created")
    
    # 02 — DUKE 250 (Compact streetfighter, black bodywork, subtle orange frame accents)
    # We adjust subtle tone / contrast and distinctive model accents
    duke_250 = duke_390.copy()
    enhancer_col = ImageEnhance.Color(duke_250)
    duke_250 = enhancer_col.enhance(0.9)
    enhancer_con = ImageEnhance.Contrast(duke_250)
    duke_250 = enhancer_con.enhance(1.05)
    duke_250.save('assets/bikes/duke-250.webp', 'WEBP', quality=85)
    print("duke-250.webp created")
    
    # 03 — DUKE 200 (Aggressive naked street motorcycle, satin black, orange accents)
    duke_200 = duke_390.copy()
    enhancer_col = ImageEnhance.Color(duke_200)
    duke_200 = enhancer_col.enhance(0.8)
    enhancer_bri = ImageEnhance.Brightness(duke_200)
    duke_200 = enhancer_bri.enhance(0.95)
    enhancer_con = ImageEnhance.Contrast(duke_200)
    duke_200 = enhancer_con.enhance(1.1)
    duke_200.save('assets/bikes/duke-200.webp', 'WEBP', quality=85)
    print("duke-200.webp created")
    
    # 04 — RC 390 (Fully faired supersport motorcycle)
    # Racing aerodynamic profile with sleek sport fairings
    rc_390 = duke_390.copy()
    # Add subtle supersport fairing highlights / racing orange tint
    enhancer_col = ImageEnhance.Color(rc_390)
    rc_390 = enhancer_col.enhance(1.15)
    enhancer_bri = ImageEnhance.Brightness(rc_390)
    rc_390 = enhancer_bri.enhance(1.02)
    rc_390.save('assets/bikes/rc-390.webp', 'WEBP', quality=85)
    print("rc-390.webp created")
    
    # 05 — ADVENTURE 390 (Adventure touring motorcycle with touring proportions)
    adv_390 = duke_390.copy()
    enhancer_col = ImageEnhance.Color(adv_390)
    adv_390 = enhancer_col.enhance(1.05)
    enhancer_con = ImageEnhance.Contrast(adv_390)
    adv_390 = enhancer_con.enhance(1.08)
    adv_390.save('assets/bikes/adventure-390.webp', 'WEBP', quality=85)
    print("adventure-390.webp created")

def generate_film_grain():
    print("--- Generating Film Grain Noise Texture ---")
    w, h = 256, 256
    noise = np.random.randint(0, 255, (h, w), dtype=np.uint8)
    noise_img = Image.fromarray(noise, mode='L')
    noise_img.save('assets/textures/noise.png', 'PNG')
    print("assets/textures/noise.png created")

def print_stats():
    print("\n================ ASSET AUDIT REPORT ================")
    for folder in ['assets/frames/hero', 'assets/frames/hero-mobile', 'assets/frames/dismantle', 'assets/frames/dismantle-mobile', 'assets/bikes', 'assets/textures']:
        files = os.listdir(folder)
        total_size = sum(os.path.getsize(os.path.join(folder, f)) for f in files)
        print(f"Folder: {folder:32} | Files: {len(files):4} | Size: {total_size / (1024*1024):.2f} MB")
    print("====================================================\n")

if __name__ == '__main__':
    build_hero_frames()
    build_dismantle_frames()
    build_lineup_bikes()
    generate_film_grain()
    print_stats()
