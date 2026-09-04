import React from "react";
import {
  MessageSquare,
  Mail,
  Calendar,
  MapPin,
  CreditCard,
  GitPullRequest,
  Plane,
  MessageCircle,
  Car,
  FileText,
  Settings,
  Bell,
  Cpu,
  ShieldCheck,
  Radio,
  Zap,
} from "lucide-react";

interface AppIconProps {
  name: string;
  className?: string;
}

export const AppIcon: React.FC<AppIconProps> = ({ name, className = "w-5 h-5" }) => {
  switch (name) {
    case "MessageSquare":
    case "Slack":
      return <MessageSquare className={className} />;
    case "Mail":
    case "Gmail":
      return <Mail className={className} />;
    case "Calendar":
      return <Calendar className={className} />;
    case "MapPin":
    case "Google Maps":
      return <MapPin className={className} />;
    case "CreditCard":
    case "Chase Mobile":
      return <CreditCard className={className} />;
    case "GitPullRequest":
    case "GitHub":
      return <GitPullRequest className={className} />;
    case "Plane":
    case "FlightTracker":
      return <Plane className={className} />;
    case "MessageCircle":
    case "WhatsApp":
      return <MessageCircle className={className} />;
    case "Car":
    case "Uber":
      return <Car className={className} />;
    case "FileText":
    case "Notion":
      return <FileText className={className} />;
    case "Settings":
      return <Settings className={className} />;
    case "ShieldCheck":
      return <ShieldCheck className={className} />;
    case "Radio":
      return <Radio className={className} />;
    case "Zap":
      return <Zap className={className} />;
    default:
      return <Bell className={className} />;
  }
};
