import os
import subprocess
import sys

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow"])
    from PIL import Image, ImageDraw, ImageFont

os.makedirs("assets/branding", exist_ok=True)

# Find a system font
font_path = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
if not os.path.exists(font_path):
    font_path = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"

def get_font(size):
    try:
        if os.path.exists(font_path):
            return ImageFont.truetype(font_path, size)
        else:
            return ImageFont.load_default()
    except:
        return ImageFont.load_default()

# Generate Icon (512x512)
img = Image.new('RGB', (512, 512), color='#b7d959')
d = ImageDraw.Draw(img)
font1 = get_font(350)
text = "L"
try:
    bbox = d.textbbox((0,0), text, font=font1)
    w = bbox[2] - bbox[0]
    h = bbox[3] - bbox[1]
except:
    w, h = 200, 300
d.text(((512-w)/2, (512-h)/2 - 70), text, fill='#0b0d10', font=font1)
img.save("assets/branding/icon.jpg", quality=100)

# Generate Logo
# Increase width, make font a bit smaller to ensure it NEVER gets cropped by Stripe
logo_w, logo_h = 1800, 256
img2 = Image.new('RGB', (logo_w, logo_h), color='#0b0d10') 
d2 = ImageDraw.Draw(img2)
green_rect = [20, 20, 236, 236]
d2.rounded_rectangle(green_rect, radius=20, fill='#b7d959')

font2 = get_font(150)
try:
    bbox_small = d2.textbbox((0,0), text, font=font2)
    w2 = bbox_small[2] - bbox_small[0]
    h2 = bbox_small[3] - bbox_small[1]
except:
    w2, h2 = 100, 150
d2.text((128 - w2/2 - 5, 128 - h2/2 - 30), text, fill='#0b0d10', font=font2)

font3 = get_font(95) # Made font smaller to fit inside stripe borders comfortably
text2 = "LEVERAGE IN THE GAME"
try:
    bbox2 = d2.textbbox((0,0), text2, font=font3)
    bw2 = bbox2[3]-bbox2[1]
except:
    bw2 = 95
d2.text((270, 128 - bw2/2 - 30), text2, fill='#ffffff', font=font3)
img2.save("assets/branding/logo.jpg", quality=100)

print("Successfully generated icon.jpg and logo.jpg with tighter text bounds")
