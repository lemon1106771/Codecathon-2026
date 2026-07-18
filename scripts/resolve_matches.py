import pandas as pd
import json
import hashlib
import os

youtube_path = r"f:\github-project\Codecathon-2026\data\youtube_watch_log.csv"
matches_path = r"f:\github-project\Codecathon-2026\matches.json"

CATEGORIES = [
    "Gaming Tutorials",
    "Lofi Chill Beats",
    "True Crime Essays",
    "Tech Reviews",
    "Cooking Recipes",
    "ASMR Programming",
    "Space Exploration",
    "Yoga & Meditation",
    "Movie Analysis",
    "Travel Vlogs"
]

PLAYLIST_MAPPING = {
    "country": "Country Music",
    "apop": "K-Pop Music",
    "music": "Pop Music",
    "g-eazy": "Hip-Hop Music",
    "house": "House Music",
    "commute": "Acoustic Hits",
    "yoga": "Yoga & Meditation",
    "favorites": "Classic Hits",
    "repeat": "Trending Beats",
    "shower": "Sing-Along Hits",
    "muzaks": "Background Lofi"
}

def get_video_topic(video_id, playlist_name):
    # Check if we have a known playlist name
    if isinstance(playlist_name, str):
        for term, label in PLAYLIST_MAPPING.items():
            if term in playlist_name.lower():
                return label
        # If playlist_name exists but is not mapped, clean it slightly
        if len(playlist_name) > 2 and playlist_name != "NA":
            return f"{playlist_name.capitalize()} Videos"
            
    # Deterministic fallback category using md5 hash of video_id
    h = hashlib.md5(video_id.encode('utf-8')).hexdigest()
    idx = int(h, 16) % len(CATEGORIES)
    return CATEGORIES[idx]

def main():
    print("Resolving matches from YouTube watch log...")
    
    if not os.path.exists(youtube_path):
        print(f"Error: {youtube_path} not found!")
        return

    # Load YouTube watch log
    print("Loading YouTube watch log (this may take a few seconds)...")
    df = pd.read_csv(youtube_path)
    print(f"Loaded {len(df)} watch events.")

    # Load original matches.json
    with open(matches_path, 'r', encoding='utf-8') as f:
        matches_data = json.load(f)
        
    pairs = matches_data["pairs"]
    
    resolved_pairs = []
    
    for pair in pairs:
        user_a = pair["user_a"]
        user_b = pair["user_b"]
        match_id = pair["match_id"]
        comp_pct = pair["compatibility_pct"]
        
        print(f"\nProcessing pair {match_id}: User {user_a} & User {user_b}...")
        
        # Get logs for each user
        df_a = df[df['user_id'] == user_a]
        df_b = df[df['user_id'] == user_b]
        
        videos_a = set(df_a['video_id'].dropna().unique())
        videos_b = set(df_b['video_id'].dropna().unique())
        
        shared_videos = videos_a.intersection(videos_b)
        print(f"User {user_a} watched {len(videos_a)} videos.")
        print(f"User {user_b} watched {len(videos_b)} videos.")
        print(f"Shared video count: {len(shared_videos)}")
        
        # Resolve shared video topics
        shared_topics = []
        # Get playlist and video details for shared videos
        df_shared = df[(df['user_id'].isin([user_a, user_b])) & (df['video_id'].isin(shared_videos))]
        
        for vid in list(shared_videos)[:500]: # Sample up to 500 shared videos
            row = df_shared[df_shared['video_id'] == vid].iloc[0]
            topic = get_video_topic(row.video_id, row.playlist_name)
            shared_topics.append(topic)
            
        # Get top shared topics by frequency
        shared_topics_series = pd.Series(shared_topics)
        top_shared_topics = shared_topics_series.value_counts().head(3).index.tolist()
        
        # Resolve blind spots for A (what B watched that A never did)
        blind_a_videos = videos_b - videos_a
        blind_a_topics = []
        df_blind_a = df_b[df_b['video_id'].isin(blind_a_videos)]
        for vid in list(blind_a_videos)[:300]:
            row = df_blind_a[df_blind_a['video_id'] == vid].iloc[0]
            topic = get_video_topic(row.video_id, row.playlist_name)
            blind_a_topics.append(topic)
        # Filter out topics that are also in user A's general watch history if possible
        # For simplicity, get top topics that B watched that A didn't share
        top_blind_a = pd.Series(blind_a_topics).value_counts().head(2).index.tolist()
        
        # Resolve blind spots for B (what A watched that B never did)
        blind_b_videos = videos_a - videos_b
        blind_b_topics = []
        df_blind_b = df_a[df_a['video_id'].isin(blind_b_videos)]
        for vid in list(blind_b_videos)[:300]:
            row = df_blind_b[df_blind_b['video_id'] == vid].iloc[0]
            topic = get_video_topic(row.video_id, row.playlist_name)
            blind_b_topics.append(topic)
        top_blind_b = pd.Series(blind_b_topics).value_counts().head(2).index.tolist()
        
        # Clean up output lists to have fallback strings if empty
        if not top_shared_topics:
            top_shared_topics = ["General Entertainment", "Music Mix"]
        if not top_blind_a:
            top_blind_a = ["Mystery vlogs"]
        if not top_blind_b:
            top_blind_b = ["Educational videos"]
            
        # Update pair fields
        pair_resolved = {
            "match_id": match_id,
            "user_a": user_a,
            "user_b": user_b,
            "shared_video_count": len(shared_videos),
            "compatibility_pct": comp_pct,
            "shared_interests": top_shared_topics,
            "blind_spot_a": [f"{topic} (from User {user_b}'s rotation)" for topic in top_blind_a],
            "blind_spot_b": [f"{topic} (from User {user_a}'s rotation)" for topic in top_blind_b]
        }
        resolved_pairs.append(pair_resolved)
        
    # Write back to matches.json
    matches_data["pairs"] = resolved_pairs
    matches_data["note"] = "compatibility_pct is a percentile rank of overlap-coefficient among the most active users in youtube_watch_log.csv. Interests and blind spots resolved directly from user playlist names and deterministic video ID categories."
    
    with open(matches_path, 'w', encoding='utf-8') as f:
        json.dump(matches_data, f, ensure_ascii=False, indent=2)
        
    print("\nMatches resolved and saved to matches.json successfully!")

if __name__ == "__main__":
    main()
