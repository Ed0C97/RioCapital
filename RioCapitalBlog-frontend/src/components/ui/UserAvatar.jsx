// src/components/ui/UserAvatar.jsx
import React from 'react';

// Lista di 20 colori pastello
const pastelColors = [
  '#FDE2E4', '#FEE4C4', '#FFF3C4', '#E2F0CB', '#CFF7F0',
  '#DCE7FE', '#E8D9FF', '#FAD6FF', '#FFD6E0', '#FFE4B5',
  '#F0E68C', '#E0FFFF', '#E6E6FA', '#FFF0F5', '#F5DEB3',
  '#FFEFD5', '#F0FFF0', '#F0F8FF', '#FAFAD2', '#FFE4E1'
];

// Funzione per scegliere colore basato sull'username
const getUserColor = (username) => {
  if (!username) return pastelColors[0];
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % pastelColors.length;
  return pastelColors[index];
};

// Funzione per determinare se un colore è chiaro o scuro
const isColorDark = (hexColor) => {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  // formula luminanza relativa
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.6; // <0.6 consideriamo scuro
};

const UserAvatar = ({ username, firstName, size = 32 }) => {
  const letter = firstName?.charAt(0).toUpperCase() || username?.charAt(0).toUpperCase();
  const bgColor = getUserColor(username);
  const textColor = isColorDark(bgColor) ? '#ffffff' : '#313132'; // bianco su sfondi scuri, grigio scuro su chiari

  return (
    <div
      className="rounded-full flex items-center justify-center font-medium cursor-pointer transition-all duration-200"
      style={{
        backgroundColor: bgColor,
        color: textColor,
        width: size,
        height: size,
        fontSize: size / 2
      }}
    >
      {letter}
    </div>
  );
};

export default UserAvatar;
