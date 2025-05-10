import os
import urllib.request

fire_urls = [
    "https://upload.wikimedia.org/wikipedia/commons/7/74/Building_on_fire.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/8/8a/Massive_fire.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/9/92/Firefighters_battling_a_fire.jpg"
]

road_urls = [
    "https://upload.wikimedia.org/wikipedia/commons/2/2f/Car_Crash.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/4/47/Traffic_accident_1.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/2/2f/Car_Accident_in_Myanmar.jpg"
]

def download_images(image_list, category):
    path = os.path.join("dataset", category)
    os.makedirs(path, exist_ok=True)
    for i, url in enumerate(image_list):
        try:
            filename = os.path.join(path, f"{category}_{i}.jpg")
            urllib.request.urlretrieve(url, filename)
            print(f"✅ Downloaded {filename}")
        except Exception as e:
            print(f"❌ Failed to download {url} — {e}")

download_images(fire_urls, "fire")
download_images(road_urls, "road")
