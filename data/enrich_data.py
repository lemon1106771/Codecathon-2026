import csv
import hashlib
import json
import os
import sys

csv_input_path = r"c:\Users\lemin\OneDrive - Swinburne University\Documents\Code\Codecathon\Codecathon-2026\data\youtube_watch_log.csv"
csv_output_path = r"c:\Users\lemin\OneDrive - Swinburne University\Documents\Code\Codecathon\Codecathon-2026\data\youtube_watch_log_enriched.csv"
json_output_path = r"c:\Users\lemin\OneDrive - Swinburne University\Documents\Code\Codecathon\Codecathon-2026\data\user_profiles.json"

CATEGORIES_CHANNELS = {
    "Tech & Science": ["Marques Brownlee", "Linus Tech Tips", "Veritasium", "VSauce", "Mark Rober", "Kurzgesagt"],
    "Gaming": ["PewDiePie", "Markiplier", "Jacksepticeye", "Ninja", "Dream", "Shroud"],
    "Music": ["Lofi Girl", "Vevo", "Chillhop Music", "NoCopyrightSounds", "Monstercat"],
    "Education & History": ["TED-Ed", "CrashCourse", "Khan Academy", "Oversimplified", "Tom Scott"],
    "Entertainment": ["MrBeast", "Dude Perfect", "Zach King", "Corridor Crew"],
    "Comedy": ["Key & Peele", "CollegeHumor", "Smosh", "CalebCity"],
    "Lifestyle & Vlogs": ["Casey Neistat", "Emma Chamberlain", "Peter McKinnon", "Ali Abdaal"],
    "Movies & Animation": ["Pixar", "Marvel Studios", "Screen Junkies", "CinemaSins"],
    "Sports": ["ESPN", "NBA", "Red Bull", "UFC"],
    "News & Politics": ["BBC News", "Vox", "TLDR News", "Philip DeFranco"]
}

CATEGORIES = list(CATEGORIES_CHANNELS.keys())

DURATION_RANGES = {
    "Tech & Science": (300, 1200),
    "Gaming": (600, 3600),
    "Music": (120, 300),
    "Education & History": (180, 900),
    "Entertainment": (300, 1800),
    "Comedy": (60, 600),
    "Lifestyle & Vlogs": (300, 1500),
    "Movies & Animation": (120, 1800),
    "Sports": (120, 2400),
    "News & Politics": (180, 900)
}

def get_metadata(video_id):
    # Deterministic assignment based on md5 hash
    h = int(hashlib.md5(video_id.encode('utf-8')).hexdigest(), 16)
    
    # Pick category
    cat_idx = h % len(CATEGORIES)
    category = CATEGORIES[cat_idx]
    
    # Pick channel from that category
    channels = CATEGORIES_CHANNELS[category]
    chan_idx = (h // len(CATEGORIES)) % len(channels)
    channel = channels[chan_idx]
    
    return category, channel

def get_duration(log_id, category):
    low, high = DURATION_RANGES.get(category, (60, 600))
    h = int(hashlib.md5(log_id.encode('utf-8')).hexdigest(), 16)
    duration = low + (h % (high - low + 1))
    return duration

def get_hour(watch_date):
    try:
        # Date format expected: '2018-09-13 03:10:18'
        time_part = watch_date.split(' ')[1]
        hour = int(time_part.split(':')[0])
        return hour
    except:
        return 12  # fallback

def run():
    print("Starting data enrichment process...")
    if not os.path.exists(csv_input_path):
        print(f"Input file not found: {csv_input_path}")
        sys.exit(1)

    # Initialize user profiles aggregation dictionary
    profiles = {}

    print("Reading and enriching dataset...")
    
    fieldnames = ['log_id', 'user_id', 'video_id', 'watch_date', 'subscribed', 'playlist_name', 
                  'channel_name', 'category', 'watch_hour', 'watch_duration']

    row_count = 0
    
    with open(csv_input_path, mode='r', encoding='utf-8') as infile, \
         open(csv_output_path, mode='w', newline='', encoding='utf-8') as outfile:
        
        reader = csv.DictReader(infile)
        writer = csv.DictWriter(outfile, fieldnames=fieldnames)
        writer.writeheader()
        
        for row in reader:
            log_id = row['log_id']
            user_id = row['user_id']
            video_id = row['video_id']
            watch_date = row['watch_date']
            
            # Enrich fields
            category, channel = get_metadata(video_id)
            watch_hour = get_hour(watch_date)
            watch_duration = get_duration(log_id, category)
            
            # Write to output CSV
            enriched_row = dict(row)
            enriched_row['category'] = category
            enriched_row['channel_name'] = channel
            enriched_row['watch_hour'] = watch_hour
            enriched_row['watch_duration'] = watch_duration
            writer.writerow(enriched_row)
            
            # Aggregate user profile
            if user_id not in profiles:
                profiles[user_id] = {
                    'user_id': user_id,
                    'categories': {cat: 0 for cat in CATEGORIES},
                    'channels': {},
                    'hours': [0] * 24,
                    'videos': set()
                }
            
            prof = profiles[user_id]
            prof['categories'][category] += watch_duration
            prof['channels'][channel] = prof['channels'].get(channel, 0) + watch_duration
            prof['hours'][watch_hour] += 1
            prof['videos'].add(video_id)
            
            row_count += 1
            if row_count % 200000 == 0:
                print(f"Processed {row_count} rows...")

    print(f"Finished writing enriched CSV ({row_count} rows).")
    print("Preparing aggregated user profiles JSON...")
    
    # Format profiles for JSON (normalize vectors, convert sets to lists)
    json_profiles = {}
    for user_id, prof in profiles.items():
        # Normalize categories (duration percentage)
        total_cat_duration = sum(prof['categories'].values())
        if total_cat_duration > 0:
            norm_categories = {cat: val / total_cat_duration for cat, val in prof['categories'].items()}
        else:
            norm_categories = {cat: 0.0 for cat in CATEGORIES}
            
        # Normalize channels (duration percentage)
        total_chan_duration = sum(prof['channels'].values())
        if total_chan_duration > 0:
            norm_channels = {chan: val / total_chan_duration for chan, val in prof['channels'].items()}
        else:
            norm_channels = {}
            
        # Normalize hour counts
        total_hours = sum(prof['hours'])
        if total_hours > 0:
            norm_hours = [val / total_hours for val in prof['hours']]
        else:
            norm_hours = [1/24.0] * 24
            
        # Keep all videos as a list
        videos_list = list(prof['videos'])
        
        json_profiles[user_id] = {
            'user_id': user_id,
            'categories': norm_categories,
            'channels': norm_channels,
            'hours': norm_hours,
            'videos': videos_list
        }
        
    print(f"Writing profiles to {json_output_path}...")
    with open(json_output_path, mode='w', encoding='utf-8') as f:
        json.dump(json_profiles, f)
        
    print("Enrichment complete!")
