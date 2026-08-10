from PIL import Image

img_path = r'C:\Users\Jasamedika\.gemini\antigravity-ide\brain\a0a4b355-fb26-4f93-b351-07de9511a8ee\kosan_k_emblem_only_1786363292448.png'
img = Image.open(img_path)
width, height = img.size

# Find bounding box of non-black pixels to crop tightly
gray = img.convert('L')
threshold = 25
bbox = gray.point(lambda p: 255 if p > threshold else 0).getbbox()

if bbox:
    # Add a small 4% padding
    pad = int(width * 0.04)
    x1 = max(0, bbox[0] - pad)
    y1 = max(0, bbox[1] - pad)
    x2 = min(width, bbox[2] + pad)
    y2 = min(height, bbox[3] + pad)
    
    # Make it a square crop
    w_crop = x2 - x1
    h_crop = y2 - y1
    side = max(w_crop, h_crop)
    
    cx = (x1 + x2) // 2
    cy = (y1 + y2) // 2
    
    x1 = max(0, cx - side // 2)
    y1 = max(0, cy - side // 2)
    x2 = min(width, x1 + side)
    y2 = min(height, y1 + side)
    
    cropped = img.crop((x1, y1, x2, y2))
    cropped.save(r'public/images/logo.png')
    print(f"Tight crop saved to public/images/logo.png, size {x2-x1}x{y2-y1}")
else:
    img.save(r'public/images/logo.png')
    print("Saved original image")
