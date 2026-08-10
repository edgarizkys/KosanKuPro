from PIL import Image

img_path = r'C:\Users\Jasamedika\.gemini\antigravity-ide\brain\a0a4b355-fb26-4f93-b351-07de9511a8ee\kosanku_pro_custom_logo_1786363198914.png'
img = Image.open(img_path)
width, height = img.size

print(f"Image size: {width}x{height}")

# Crop upper region containing the 'K' and building silhouette, removing text at the bottom
# Let's crop from top 10% to 72%
crop_box = (int(width * 0.25), int(height * 0.12), int(width * 0.75), int(height * 0.70))
cropped = img.crop(crop_box)

out_path = r'public/images/logo.png'
cropped.save(out_path)
print(f"Saved cropped clean K logo to {out_path}")
