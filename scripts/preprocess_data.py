import pandas as pd
import numpy as np
import json
import os
import hashlib

# Define paths
spotify_path = r"f:\github-project\Codecathon-2026\data\spotify_history.csv"
youtube_path = r"f:\github-project\Codecathon-2026\data\youtube_watch_log.csv"
output_path = r"f:\github-project\Codecathon-2026\data\user_profiles.json"

# Make sure data directory exists
os.makedirs(os.path.dirname(output_path), exist_ok=True)

# 8 Core genres
GENRES = [
    "ROCK",
    "INDIE_ALT",
    "POP",
    "FOLK_COUNTRY",
    "JAZZ_TRADITIONAL",
    "CLASSICAL_SOUNDTRACK",
    "LATIN",
    "ELECTRONIC_EDM"
]

# Genre base audio features: [energy, valence, danceability]
GENRE_FEATURES = {
    "ROCK": [0.75, 0.50, 0.45],
    "INDIE_ALT": [0.65, 0.55, 0.55],
    "POP": [0.70, 0.65, 0.70],
    "FOLK_COUNTRY": [0.45, 0.45, 0.50],
    "JAZZ_TRADITIONAL": [0.30, 0.40, 0.55],
    "CLASSICAL_SOUNDTRACK": [0.20, 0.25, 0.20],
    "LATIN": [0.72, 0.75, 0.78],
    "ELECTRONIC_EDM": [0.82, 0.52, 0.72]
}

# Artist mapping for top artists
ARTIST_GENRES = {
    "The Beatles": "ROCK",
    "Led Zeppelin": "ROCK",
    "The Rolling Stones": "ROCK",
    "Pink Floyd": "ROCK",
    "Queen": "ROCK",
    "AC/DC": "ROCK",
    "Jimi Hendrix": "ROCK",
    "Aerosmith": "ROCK",
    "The Who": "ROCK",
    "The Kinks": "ROCK",
    "David Bowie": "ROCK",
    
    "The Killers": "INDIE_ALT",
    "Radiohead": "INDIE_ALT",
    "The Black Keys": "INDIE_ALT",
    "The Strokes": "INDIE_ALT",
    "Arctic Monkeys": "INDIE_ALT",
    "The Velvet Underground": "INDIE_ALT",
    "Lou Reed": "INDIE_ALT",
    "Arcade Fire": "INDIE_ALT",
    "Kings of Leon": "INDIE_ALT",
    "Vampire Weekend": "INDIE_ALT",
    "Cage The Elephant": "INDIE_ALT",
    "The Voidz": "INDIE_ALT",
    "AWOLNATION": "INDIE_ALT",
    
    "John Mayer": "POP",
    "Coldplay": "POP",
    "Imagine Dragons": "POP",
    "Ed Sheeran": "POP",
    "OneRepublic": "POP",
    "Maroon 5": "POP",
    "Bruno Mars": "POP",
    "Sam Smith": "POP",
    "Reik": "POP",
    "Morat": "POP",
    "fun.": "POP",
    "Daughtry": "POP",
    
    "Bob Dylan": "FOLK_COUNTRY",
    "Johnny Cash": "FOLK_COUNTRY",
    "Mumford & Sons": "FOLK_COUNTRY",
    "The Lumineers": "FOLK_COUNTRY",
    "Zac Brown Band": "FOLK_COUNTRY",
    "Willie Nelson": "FOLK_COUNTRY",
    "Simon & Garfunkel": "FOLK_COUNTRY",
    "Yusuf / Cat Stevens": "FOLK_COUNTRY",
    "James Bay": "FOLK_COUNTRY",
    "Vance Joy": "FOLK_COUNTRY",
    
    "Frank Sinatra": "JAZZ_TRADITIONAL",
    "Dean Martin": "JAZZ_TRADITIONAL",
    "Tony Bennett": "JAZZ_TRADITIONAL",
    "Bobby Darin": "JAZZ_TRADITIONAL",
    
    "Howard Shore": "CLASSICAL_SOUNDTRACK",
    "Ennio Morricone": "CLASSICAL_SOUNDTRACK",
    "John Williams": "CLASSICAL_SOUNDTRACK",
    "Giacomo Puccini": "CLASSICAL_SOUNDTRACK",
    "Giuseppe Verdi": "CLASSICAL_SOUNDTRACK",
    "Justin Hurwitz": "CLASSICAL_SOUNDTRACK",
    
    "Joaquín Sabina": "LATIN",
    "José Alfredo Jimenez": "LATIN",
    "Pedro Infante": "LATIN",
    "Juanes": "LATIN",
    "Ricardo Arjona": "LATIN",
    "Jorge Drexler": "LATIN",
    "Vicente Fernández": "LATIN",
    "Antonio Aguilar": "LATIN",
    "Alejandro Fernández": "LATIN",
    "Maná": "LATIN",
    "Ed Maverick": "LATIN"
}

# Map playlist name terms to genres
PLAYLIST_GENRES = {
    "country": "FOLK_COUNTRY",
    "apop": "POP",
    "music": "POP",
    "g-eazy": "POP",
    "apop": "POP",
    "house": "ELECTRONIC_EDM",
    "dj": "ELECTRONIC_EDM",
    "mix": "INDIE_ALT",
    "yoga": "JAZZ_TRADITIONAL",
    "mood": "INDIE_ALT",
    "repeat": "POP",
    "favorite": "ROCK"
}

def get_artist_genre(artist_name):
    if artist_name in ARTIST_GENRES:
        return ARTIST_GENRES[artist_name]
    # Fallback to deterministic hash
    h = hashlib.md5(artist_name.encode('utf-8')).hexdigest()
    idx = int(h, 16) % len(GENRES)
    return GENRES[idx]

def get_video_genre(video_id, playlist_name):
    # If playlist name has a match
    if isinstance(playlist_name, str):
        for term, gen in PLAYLIST_GENRES.items():
            if term in playlist_name.lower():
                return gen
    # Fallback to deterministic hash of video_id
    h = hashlib.md5(video_id.encode('utf-8')).hexdigest()
    idx = int(h, 16) % len(GENRES)
    return GENRES[idx]

def calculate_listening_habits(timestamps):
    # Given a list of timestamps, return percentage of plays in:
    # Morning (5am-12pm), Afternoon (12pm-5pm), Evening (5pm-10pm), Night (10pm-5am)
    hours = [pd.to_datetime(ts).hour for ts in timestamps if pd.notnull(ts)]
    if not hours:
        return {"Morning": 25, "Afternoon": 25, "Evening": 25, "Night": 25}
    
    morning = sum(5 <= h < 12 for h in hours)
    afternoon = sum(12 <= h < 17 for h in hours)
    evening = sum(17 <= h < 22 for h in hours)
    night = sum(h >= 22 or h < 5 for h in hours)
    
    total = len(hours)
    return {
        "Morning": round((morning / total) * 100),
        "Afternoon": round((afternoon / total) * 100),
        "Evening": round((evening / total) * 100),
        "Night": round((night / total) * 100)
    }

def main():
    print("Starting data preprocessing...")
    
    profiles = {}
    
    # ------------------
    # 1. Process Spotify (User 0)
    # ------------------
    print("Reading Spotify history...")
    df_spotify = pd.read_csv(spotify_path)
    
    # Map genres to all plays
    df_spotify['genre'] = df_spotify['artist_name'].apply(get_artist_genre)
    
    # Genre distribution
    genre_counts = df_spotify['genre'].value_counts()
    genre_dist = {g: 0.0 for g in GENRES}
    total_sp_plays = len(df_spotify)
    for g, count in genre_counts.items():
        genre_dist[g] = float(count / total_sp_plays)
        
    # Average audio features
    avg_energy = sum(genre_dist[g] * GENRE_FEATURES[g][0] for g in GENRES)
    avg_valence = sum(genre_dist[g] * GENRE_FEATURES[g][1] for g in GENRES)
    avg_danceability = sum(genre_dist[g] * GENRE_FEATURES[g][2] for g in GENRES)
    
    # Add minor noise
    avg_energy = np.clip(avg_energy + np.random.uniform(-0.02, 0.02), 0.1, 0.95)
    avg_valence = np.clip(avg_valence + np.random.uniform(-0.02, 0.02), 0.1, 0.95)
    avg_danceability = np.clip(avg_danceability + np.random.uniform(-0.02, 0.02), 0.1, 0.95)
    
    # Create the taste vector: 8 genres + 3 features
    vector_0 = [genre_dist[g] for g in GENRES] + [float(avg_energy), float(avg_valence), float(avg_danceability)]
    
    # Normalize vector_0 for cosine similarity
    norm_0 = np.linalg.norm(vector_0)
    norm_vector_0 = (np.array(vector_0) / norm_0).tolist() if norm_0 > 0 else vector_0
    
    # Top artists
    top_sp_artists = df_spotify['artist_name'].value_counts().head(5).index.tolist()
    
    # Top tracks
    top_sp_tracks = df_spotify['track_name'].value_counts().head(5).index.tolist()
    
    # Listening habits
    habits_0 = calculate_listening_habits(df_spotify['ts'].tolist())
    
    # Blind spots
    blind_spots_0 = sorted(genre_dist.keys(), key=lambda k: genre_dist[k])[:2]
    
    profiles["0"] = {
        "user_id": 0,
        "username": "You (Loaded Spotify Profile)",
        "genres": {g: round(genre_dist[g] * 100, 1) for g in GENRES},
        "audio_features": {
            "energy": round(avg_energy, 2),
            "valence": round(avg_valence, 2),
            "danceability": round(avg_danceability, 2)
        },
        "top_artists": top_sp_artists,
        "top_tracks": top_sp_tracks,
        "habits": habits_0,
        "blind_spots": blind_spots_0,
        "vector": norm_vector_0
    }
    
    print("User 0 profile created.")
    
    # ------------------
    # 2. Process YouTube (Users 1-244)
    # ------------------
    print("Reading YouTube history...")
    df_youtube = pd.read_csv(youtube_path)
    
    # Let's map video_ids to genres deterministically
    print("Mapping YouTube videos to genres...")
    # To do this efficiently, group by user first
    grouped = df_youtube.groupby('user_id')
    
    # We will also compile a list of all artists in Spotify so we can sample them for other users
    spotify_artists = list(ARTIST_GENRES.keys())
    
    user_count = 0
    for user_id, group in grouped:
        user_count += 1
        if user_count % 50 == 0:
            print(f"Processed {user_count} / {len(grouped)} users...")
            
        # Get genres of watched videos
        video_genres = [get_video_genre(row.video_id, row.playlist_name) for row in group.itertuples()]
        
        # Calculate genre counts
        u_genre_counts = pd.Series(video_genres).value_counts()
        u_total_plays = len(group)
        
        u_genre_dist = {g: 0.0 for g in GENRES}
        for g, count in u_genre_counts.items():
            u_genre_dist[g] = float(count / u_total_plays)
            
        # Average audio features based on genre weights + unique user shifts
        # E.g. some users are naturally high-energy listeners
        user_shift = np.random.uniform(-0.05, 0.05, 3)
        u_avg_energy = np.clip(sum(u_genre_dist[g] * GENRE_FEATURES[g][0] for g in GENRES) + user_shift[0], 0.1, 0.95)
        u_avg_valence = np.clip(sum(u_genre_dist[g] * GENRE_FEATURES[g][1] for g in GENRES) + user_shift[1], 0.1, 0.95)
        u_avg_danceability = np.clip(sum(u_genre_dist[g] * GENRE_FEATURES[g][2] for g in GENRES) + user_shift[2], 0.1, 0.95)
        
        # Define vector
        u_vector = [u_genre_dist[g] for g in GENRES] + [float(u_avg_energy), float(u_avg_valence), float(u_avg_danceability)]
        u_norm = np.linalg.norm(u_vector)
        u_norm_vector = (np.array(u_vector) / u_norm).tolist() if u_norm > 0 else u_vector
        
        # Determine top genres
        sorted_genres = sorted(u_genre_dist.keys(), key=lambda k: u_genre_dist[k], reverse=True)
        top_genre = sorted_genres[0]
        second_genre = sorted_genres[1]
        
        # Sample realistic top artists based on user's top genres
        u_artists = []
        # Find artists matching top genres
        matching_artists = [a for a, g in ARTIST_GENRES.items() if g in [top_genre, second_genre]]
        if len(matching_artists) >= 3:
            u_artists = np.random.choice(matching_artists, size=3, replace=False).tolist()
        else:
            u_artists = np.random.choice(spotify_artists, size=3, replace=False).tolist()
            
        # Add a couple of other popular artists
        other_artists = np.random.choice([a for a in spotify_artists if a not in u_artists], size=2, replace=False).tolist()
        u_artists.extend(other_artists)
        
        # Sample realistic top tracks (mock names based on artist list)
        u_tracks = [
            f"Song by {u_artists[0]}",
            f"Track by {u_artists[1]}",
            f"Classic by {u_artists[2]}",
            f"Hits of {u_artists[3]}",
            f"Melody by {u_artists[4]}"
        ]
        
        # Habits
        u_habits = calculate_listening_habits(group['watch_date'].tolist())
        
        # Blind spots (lowest 2 genres)
        u_blind_spots = sorted_genres[-2:]
        
        # User name
        u_name = f"Stranger #{user_id + 4000}"
        
        profiles[str(user_id)] = {
            "user_id": int(user_id),
            "username": u_name,
            "genres": {g: round(u_genre_dist[g] * 100, 1) for g in GENRES},
            "audio_features": {
                "energy": round(u_avg_energy, 2),
                "valence": round(u_avg_valence, 2),
                "danceability": round(u_avg_danceability, 2)
            },
            "top_artists": u_artists,
            "top_tracks": u_tracks,
            "habits": u_habits,
            "blind_spots": u_blind_spots,
            "vector": u_norm_vector
        }
        
    print(f"Total YouTube user profiles created: {len(profiles) - 1}")
    
    # Save profiles
    print(f"Saving profiles to {output_path}...")
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(profiles, f, ensure_ascii=False, indent=2)
        
    print("Preprocessing completed successfully!")

if __name__ == "__main__":
    main()
