import { MdRamenDining, } from "react-icons/md";
import { FaGift, FaHouseChimney } from "react-icons/fa6";
import { FaShoppingBasket, FaCar } from "react-icons/fa";
import { IoMdBriefcase } from "react-icons/io";
import { BiSolidCat, BiSolidChurch, BiSolidHappyAlt } from "react-icons/bi";
import { AiOutlineQq } from "react-icons/ai";
import { GiSevenPointedStar } from "react-icons/gi";

// Map a string key -> icon component
export const iconRegistry = {
  pets: BiSolidCat,
  dining: MdRamenDining,
  personal: BiSolidHappyAlt,
  gift: FaGift,
  household: FaHouseChimney,
  grocery: FaShoppingBasket,
  car: FaCar,
  business: IoMdBriefcase,
  bebe: AiOutlineQq,
  church: BiSolidChurch,
  misc: GiSevenPointedStar,
  // etc...
};

// Metadata used by UI (labels + default colors)
export const iconsFromDb = [
  { id: "pets", label: "Pets", color: "orange" },
  { id: "dining", label: "Dining", color: "teal" },
  { id: "personal", label: "Personal", color: "pink" },
  { id: "gift", label: "Gift", color: "red" },
  { id: "household", label: "Household", color: "brown" },
  { id: "grocery", label: "Grocery", color: "green" },
  { id: "car", label: "Car", color: "grey" },
  { id: "business", label: "Business", color: "blue" },
  { id: "bebe", label: "Bebe", color: "purple" },
  { id: "church", label: "Church", color: "#e5e51c" },
  { id: "misc", label: "Misc.", color: "chartreuse" },
];

// Helper: map free-text category name to iconRegistry key
export const categoryToIconKey = (category) => {
  if (!category) return null;
  const key = category.toLowerCase();

  if (key.includes('pet')) return 'pets';
  if (key.includes('dine out')) return 'dining';
  if (key.includes('personal')) return 'personal';
  if (key.includes('gift')) return 'gift';
  if (key.includes('household')) return 'household';
  if (key.includes('grocery')) return 'grocery';
  if (key.includes('car')) return 'car';
  if (key.includes('business')) return 'business';
  if (key.includes('annabelle')) return 'bebe';
  if (key.includes('church')) return 'church';
  if (key.includes('misc')) return 'misc';
  if (key.includes('util')) return 'utilities';
  if (key.includes('phone') || key.includes('internet')) return 'phone';
  if (key.includes('medical') || key.includes('health')) return 'medical';
  if (key.includes('travel') || key.includes('flight')) return 'travel';

  // fallback
  return 'misc';
};

// Helper: get default color for a given iconKey from iconsFromDb
export const getColorForIconKey = (iconKey) => {
  if (!iconKey) return '#2196f3';
  const info = iconsFromDb.find((ic) => ic.id === iconKey);
  return info?.color || '#2196f3';
};