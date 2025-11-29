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
  { id: "miscellaneous", label: "miscellaneous", color: "white" },
];