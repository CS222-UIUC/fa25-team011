"use client";

import React from "react";

type RecommendedSongCardProps = {
  title: string;
  artist: string;
  albumImage: string; // URL of the album cover
  previewUrl?: string; // optional preview URL for audio
};

const RecommendedSongCard: React.FC<RecommendedSongCardProps> = ({
  title,
  artist,
  albumImage,
  previewUrl,
}) => {
  return (
    <div className="flex items-center gap-4 p-4 bg-gray-100 rounded-lg shadow hover:bg-gray-200 transition">
      {/* Album cover */}
      <img
        src={albumImage}
        alt={`${title} album cover`}
        className="w-16 h-16 rounded"
      />

      {/* Song info */}
      <div className="flex-1">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-gray-600">{artist}</p>
      </div>

      {/* Play button */}
      {previewUrl && (
        <audio controls className="w-32">
          <source src={previewUrl} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      )}
    </div>
  );
};

export default RecommendedSongCard;
