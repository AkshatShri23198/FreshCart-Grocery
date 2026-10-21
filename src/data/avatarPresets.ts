export interface AvatarPreset {
  id: string;
  label: string;
  category: 'Children' | 'Roommates' | 'Family' | 'Business' | 'Personal' | 'Savings';
  url: string;
}

export const AVATAR_PRESETS: AvatarPreset[] = [
  {
    id: 'preset_children',
    label: 'Children / Kids',
    category: 'Children',
    url: 'https://images.unsplash.com/photo-1543332164-6e82f355badc?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'preset_roommates',
    label: 'Roommates / Shared',
    category: 'Roommates',
    url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'preset_family',
    label: 'Family Household',
    category: 'Family',
    url: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'preset_chef',
    label: 'Chef / Catering',
    category: 'Business',
    url: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'preset_personal',
    label: 'Personal / Individual',
    category: 'Personal',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'preset_savings',
    label: 'Savings / Jar',
    category: 'Savings',
    url: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'preset_baker',
    label: 'Bakery & Sweets',
    category: 'Business',
    url: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'preset_student',
    label: 'Student / Dorm',
    category: 'Roommates',
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  },
];
