import { useState } from 'react';
import {
  Heart,
  Calendar,
  BookOpen,
  Phone,
  Smile,
  Meh,
  Frown,
  Sun,
  Moon,
  Cloud,
  Leaf,
  MessageCircle,
  Clock,
  Shield,
  Users,
  ChevronRight,
  Play,
  Headphones,
  FileText,
  Video,
  Star,
  CheckCircle,
} from 'lucide-react';

// Neumorphic style utilities
const neumorphic = {
  raised: 'bg-[#E8EEF5] shadow-[8px_8px_16px_#c5ccd6,-8px_-8px_16px_#ffffff]',
  pressed: 'bg-[#E8EEF5] shadow-[inset_4px_4px_8px_#c5ccd6,inset_-4px_-4px_8px_#ffffff]',
  button: 'bg-[#E8EEF5] shadow-[6px_6px_12px_#c5ccd6,-6px_-6px_12px_#ffffff] hover:shadow-[4px_4px_8px_#c5ccd6,-4px_-4px_8px_#ffffff] active:shadow-[inset_4px_4px_8px_#c5ccd6,inset_-4px_-4px_8px_#ffffff]',
  subtle: 'bg-[#E8EEF5] shadow-[4px_4px_8px_#c5ccd6,-4px_-4px_8px_#ffffff]',
};

const pastelColors = {
  lavender: '#E6E6FA',
  mint: '#98FB98',
  peach: '#FFDAB9',
  skyBlue: '#87CEEB',
  blush: '#FFB6C1',
  cream: '#FFFDD0',
  sage: '#BCB88A',
};

export default function MentalHealthLanding() {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const moods = [
    { icon: Smile, label: 'Great', color: '#98FB98', value: 5 },
    { icon: Smile, label: 'Good', color: '#87CEEB', value: 4 },
    { icon: Meh, label: 'Okay', color: '#FFFDD0', value: 3 },
    { icon: Meh, label: 'Low', color: '#FFDAB9', value: 2 },
    { icon: Frown, label: 'Difficult', color: '#FFB6C1', value: 1 },
  ];

  const therapists = [
    { name: 'Dr. Sarah Chen', specialty: 'Anxiety & Depression', rating: 4.9, available: true, image: '👩‍⚕️' },
    { name: 'Dr. Michael Ross', specialty: 'Trauma & PTSD', rating: 4.8, available: true, image: '👨‍⚕️' },
    { name: 'Dr. Emily Parker', specialty: 'Relationships', rating: 4.9, available: false, image: '👩‍⚕️' },
  ];

  const resources = [
    { title: 'Understanding Anxiety', type: 'Article', icon: FileText, duration: '5 min read', color: pastelColors.lavender },
    { title: 'Guided Meditation', type: 'Audio', icon: Headphones, duration: '15 min', color: pastelColors.mint },
    { title: 'Sleep Better Tonight', type: 'Video', icon: Video, duration: '20 min', color: pastelColors.skyBlue },
    { title: 'Breathing Exercises', type: 'Interactive', icon: Play, duration: '10 min', color: pastelColors.peach },
  ];

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const moodHistory = [4, 3, 4, 5, 3, 4, null]; // null = today (not yet logged)

  return (
    <div className="min-h-screen bg-[#E8EEF5] overflow-x-hidden">
      {/* Navigation */}
      <nav className={`sticky top-0 z-50 ${neumorphic.raised} backdrop-blur-sm bg-opacity-90`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${neumorphic.button}`}>
                <Leaf className="w-6 h-6 text-emerald-500" />
              </div>
              <span className="text-xl font-semibold text-slate-700">MindfulSpace</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#mood" className="text-slate-600 hover:text-slate-800 transition-colors">Mood Tracker</a>
              <a href="#therapy" className="text-slate-600 hover:text-slate-800 transition-colors">Therapy</a>
              <a href="#resources" className="text-slate-600 hover:text-slate-800 transition-colors">Resources</a>
              <a href="#crisis" className="text-slate-600 hover:text-slate-800 transition-colors">Get Help</a>
            </div>
            <button className={`px-6 py-2.5 rounded-xl ${neumorphic.button} text-slate-700 font-medium transition-all duration-200`}>
              Sign In
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${neumorphic.subtle}`}>
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span className="text-sm text-slate-600">Your mental wellness journey starts here</span>
                </div>
                <h1 className="text-5xl lg:text-6xl font-bold text-slate-800 leading-tight">
                  Find Your
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400"> Inner Peace</span>
                </h1>
                <p className="text-lg text-slate-600 leading-relaxed">
                  A safe space to track your emotions, connect with licensed therapists,
                  and access resources designed to support your mental well-being.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <button className={`px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 text-white font-semibold shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300 transition-all duration-300 flex items-center gap-2`}>
                  Start Your Journey
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button className={`px-8 py-4 rounded-2xl ${neumorphic.button} text-slate-700 font-medium transition-all duration-200 flex items-center gap-2`}>
                  <Play className="w-5 h-5" />
                  Watch Demo
                </button>
              </div>

              <div className="flex items-center gap-8 pt-4">
                <div className="flex -space-x-3">
                  {['😊', '🥰', '😌', '🤗'].map((emoji, i) => (
                    <div key={i} className={`w-10 h-10 rounded-full ${neumorphic.raised} flex items-center justify-center text-lg`}>
                      {emoji}
                    </div>
                  ))}
                </div>
                <div>
                  <p className="font-semibold text-slate-700">10,000+ users</p>
                  <p className="text-sm text-slate-500">finding peace daily</p>
                </div>
              </div>
            </div>

            {/* Hero Illustration - Floating Cards */}
            <div className="relative h-[500px] hidden lg:block">
              <div className={`absolute top-0 right-0 w-64 p-6 rounded-3xl ${neumorphic.raised} transform rotate-3 hover:rotate-0 transition-transform duration-500`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-xl bg-emerald-100">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                  </div>
                  <span className="font-medium text-slate-700">Daily Check-in</span>
                </div>
                <p className="text-sm text-slate-500">How are you feeling today?</p>
                <div className="flex gap-2 mt-3">
                  {['😊', '😐', '😔'].map((emoji, i) => (
                    <div key={i} className={`p-2 rounded-xl ${neumorphic.subtle} text-xl cursor-pointer hover:scale-110 transition-transform`}>
                      {emoji}
                    </div>
                  ))}
                </div>
              </div>

              <div className={`absolute top-32 left-0 w-56 p-5 rounded-3xl ${neumorphic.raised} transform -rotate-3 hover:rotate-0 transition-transform duration-500`}>
                <div className="flex items-center gap-2 mb-3">
                  <Moon className="w-5 h-5 text-indigo-400" />
                  <span className="font-medium text-slate-700">Sleep Score</span>
                </div>
                <div className="text-3xl font-bold text-slate-800">8.2<span className="text-lg text-slate-400">/10</span></div>
                <div className="mt-2 h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div className="h-full w-4/5 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400" />
                </div>
              </div>

              <div className={`absolute bottom-20 right-10 w-72 p-5 rounded-3xl ${neumorphic.raised} transform rotate-2 hover:rotate-0 transition-transform duration-500`}>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-medium text-slate-700">Weekly Progress</span>
                  <Cloud className="w-5 h-5 text-cyan-400" />
                </div>
                <div className="flex items-end justify-between h-24 gap-2">
                  {[60, 80, 45, 90, 70, 85, 75].map((height, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className={`w-full rounded-full ${i === 6 ? 'bg-gradient-to-t from-emerald-400 to-cyan-400' : 'bg-slate-200'}`}
                        style={{ height: `${height}%` }}
                      />
                      <span className="text-xs text-slate-400">{weekDays[i][0]}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`absolute bottom-0 left-10 w-48 p-4 rounded-2xl ${neumorphic.raised}`}>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-pink-100">
                    <Heart className="w-5 h-5 text-pink-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">Mindfulness</p>
                    <p className="text-xs text-slate-500">7 day streak 🔥</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mood Tracking Section */}
      <section id="mood" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">Track Your Mood</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Understanding your emotions is the first step to wellness.
              Log your mood daily and discover patterns that matter.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Mood Selector */}
            <div className={`p-8 rounded-3xl ${neumorphic.raised}`}>
              <h3 className="text-xl font-semibold text-slate-700 mb-6">How are you feeling right now?</h3>
              <div className="flex justify-between gap-4">
                {moods.map((mood, index) => {
                  const Icon = mood.icon;
                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedMood(mood.value)}
                      className={`flex-1 p-4 rounded-2xl transition-all duration-300 ${
                        selectedMood === mood.value
                          ? neumorphic.pressed
                          : neumorphic.button
                      }`}
                    >
                      <div
                        className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center transition-transform duration-300 ${
                          selectedMood === mood.value ? 'scale-110' : ''
                        }`}
                        style={{ backgroundColor: mood.color }}
                      >
                        <Icon className={`w-6 h-6 ${mood.value >= 4 ? 'text-emerald-700' : mood.value === 3 ? 'text-amber-700' : 'text-rose-700'}`} />
                      </div>
                      <p className="text-sm font-medium text-slate-600">{mood.label}</p>
                    </button>
                  );
                })}
              </div>

              {selectedMood && (
                <div className={`mt-6 p-4 rounded-2xl ${neumorphic.pressed}`}>
                  <label className="block text-sm font-medium text-slate-600 mb-2">
                    What's on your mind? (Optional)
                  </label>
                  <textarea
                    className="w-full bg-transparent border-none resize-none focus:outline-none text-slate-700 placeholder-slate-400"
                    rows={3}
                    placeholder="Take a moment to reflect on your day..."
                  />
                </div>
              )}

              <button
                className={`w-full mt-6 py-4 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 text-white font-semibold shadow-lg shadow-emerald-200 hover:shadow-xl transition-all duration-300 ${!selectedMood ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!selectedMood}
              >
                Log Today's Mood
              </button>
            </div>

            {/* Mood History */}
            <div className={`p-8 rounded-3xl ${neumorphic.raised}`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-slate-700">This Week</h3>
                <button className={`px-4 py-2 rounded-xl ${neumorphic.subtle} text-sm text-slate-600`}>
                  View All
                </button>
              </div>

              <div className="grid grid-cols-7 gap-3 mb-8">
                {weekDays.map((day, index) => {
                  const moodValue = moodHistory[index];
                  const moodData = moodValue ? moods.find(m => m.value === moodValue) : null;
                  const isToday = index === 6;

                  return (
                    <div key={day} className="text-center">
                      <p className="text-xs text-slate-500 mb-2">{day}</p>
                      <div
                        className={`w-full aspect-square rounded-2xl flex items-center justify-center ${
                          isToday ? 'border-2 border-dashed border-slate-300' : neumorphic.subtle
                        }`}
                        style={{ backgroundColor: moodData?.color || 'transparent' }}
                      >
                        {moodData ? (
                          <moodData.icon className={`w-5 h-5 ${moodValue && moodValue >= 4 ? 'text-emerald-700' : moodValue === 3 ? 'text-amber-700' : 'text-rose-700'}`} />
                        ) : isToday ? (
                          <span className="text-xs text-slate-400">Today</span>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className={`p-4 rounded-2xl ${neumorphic.pressed}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-slate-600">Weekly Wellness Score</span>
                  <span className="text-2xl font-bold text-slate-800">76%</span>
                </div>
                <div className="h-3 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all duration-500"
                    style={{ width: '76%' }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">+12% from last week</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Therapy Booking Section */}
      <section id="therapy" className="py-20 px-6 bg-gradient-to-b from-transparent to-[#dce3ed]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">Book a Therapy Session</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Connect with licensed therapists who understand you.
              Flexible scheduling, secure video calls, and personalized care.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-12">
            {therapists.map((therapist, index) => (
              <div key={index} className={`p-6 rounded-3xl ${neumorphic.raised} hover:translate-y-[-4px] transition-all duration-300`}>
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-16 h-16 rounded-2xl ${neumorphic.subtle} flex items-center justify-center text-3xl`}>
                    {therapist.image}
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    therapist.available
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {therapist.available ? 'Available' : 'Busy'}
                  </div>
                </div>

                <h4 className="text-lg font-semibold text-slate-800 mb-1">{therapist.name}</h4>
                <p className="text-sm text-slate-500 mb-3">{therapist.specialty}</p>

                <div className="flex items-center gap-2 mb-4">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < Math.floor(therapist.rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-slate-600">{therapist.rating}</span>
                </div>

                <button
                  className={`w-full py-3 rounded-xl ${
                    therapist.available
                      ? 'bg-gradient-to-r from-emerald-400 to-cyan-400 text-white shadow-lg shadow-emerald-200'
                      : neumorphic.button + ' text-slate-500'
                  } font-medium transition-all duration-300`}
                  disabled={!therapist.available}
                >
                  {therapist.available ? 'Book Session' : 'Join Waitlist'}
                </button>
              </div>
            ))}
          </div>

          {/* Calendar Preview */}
          <div className={`p-8 rounded-3xl ${neumorphic.raised}`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-slate-700">Available Time Slots</h3>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-slate-400" />
                <span className="text-slate-600">January 2026</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {[27, 28, 29, 30, 31, 1, 2].map((day, index) => {
                const isSelected = selectedDate === `2026-01-${day}`;
                const hasSlots = [27, 28, 30, 1].includes(day);

                return (
                  <button
                    key={index}
                    onClick={() => hasSlots && setSelectedDate(`2026-01-${day}`)}
                    className={`p-4 rounded-2xl text-center transition-all duration-300 ${
                      isSelected
                        ? 'bg-gradient-to-r from-emerald-400 to-cyan-400 text-white shadow-lg'
                        : hasSlots
                          ? neumorphic.button
                          : neumorphic.pressed + ' opacity-50 cursor-not-allowed'
                    }`}
                    disabled={!hasSlots}
                  >
                    <p className={`text-xs mb-1 ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>
                      {weekDays[index]}
                    </p>
                    <p className={`text-lg font-semibold ${isSelected ? 'text-white' : 'text-slate-700'}`}>
                      {day}
                    </p>
                    {hasSlots && (
                      <p className={`text-xs mt-1 ${isSelected ? 'text-white/80' : 'text-emerald-500'}`}>
                        {Math.floor(Math.random() * 5) + 1} slots
                      </p>
                    )}
                  </button>
                );
              })}
            </div>

            {selectedDate && (
              <div className="mt-6 flex flex-wrap gap-3">
                {['9:00 AM', '10:30 AM', '2:00 PM', '3:30 PM', '5:00 PM'].map((time) => (
                  <button
                    key={time}
                    className={`px-4 py-2 rounded-xl ${neumorphic.button} text-sm text-slate-600 hover:text-emerald-600 transition-colors`}
                  >
                    <Clock className="w-4 h-4 inline mr-2" />
                    {time}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Resource Library Section */}
      <section id="resources" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">Resource Library</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Expert-curated content to support your mental health journey.
              Articles, guided meditations, videos, and more.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mb-10">
            {['All', 'Articles', 'Meditation', 'Videos', 'Exercises'].map((category, index) => (
              <button
                key={category}
                className={`px-6 py-2.5 rounded-xl transition-all duration-300 ${
                  index === 0
                    ? 'bg-gradient-to-r from-emerald-400 to-cyan-400 text-white shadow-lg'
                    : neumorphic.button + ' text-slate-600'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {resources.map((resource, index) => {
              const Icon = resource.icon;
              return (
                <div
                  key={index}
                  className={`group p-6 rounded-3xl ${neumorphic.raised} hover:translate-y-[-4px] transition-all duration-300 cursor-pointer`}
                >
                  <div
                    className="w-full h-32 rounded-2xl mb-4 flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
                    style={{ backgroundColor: resource.color }}
                  >
                    <Icon className="w-12 h-12 text-slate-700/50" />
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium`} style={{ backgroundColor: resource.color }}>
                      {resource.type}
                    </span>
                    <span className="text-xs text-slate-500">{resource.duration}</span>
                  </div>

                  <h4 className="font-semibold text-slate-800 group-hover:text-emerald-600 transition-colors">
                    {resource.title}
                  </h4>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-10">
            <button className={`px-8 py-4 rounded-2xl ${neumorphic.button} text-slate-700 font-medium transition-all duration-200 inline-flex items-center gap-2`}>
              <BookOpen className="w-5 h-5" />
              Explore All Resources
            </button>
          </div>
        </div>
      </section>

      {/* Crisis Support Section */}
      <section id="crisis" className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className={`p-8 md:p-12 rounded-3xl bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-100`}>
            <div className="text-center mb-8">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4`} style={{ backgroundColor: pastelColors.blush }}>
                <Phone className="w-8 h-8 text-rose-600" />
              </div>
              <h2 className="text-3xl font-bold text-slate-800 mb-4">Need Immediate Support?</h2>
              <p className="text-lg text-slate-600">
                If you're in crisis or need immediate help, you're not alone.
                Reach out to these resources anytime, 24/7.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className={`p-6 rounded-2xl bg-white/80 backdrop-blur shadow-lg`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-xl bg-rose-100">
                    <Phone className="w-5 h-5 text-rose-600" />
                  </div>
                  <h4 className="font-semibold text-slate-800">Crisis Hotline</h4>
                </div>
                <p className="text-2xl font-bold text-rose-600 mb-2">988</p>
                <p className="text-sm text-slate-500">Suicide & Crisis Lifeline - Available 24/7</p>
              </div>

              <div className={`p-6 rounded-2xl bg-white/80 backdrop-blur shadow-lg`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-xl bg-emerald-100">
                    <MessageCircle className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h4 className="font-semibold text-slate-800">Crisis Text Line</h4>
                </div>
                <p className="text-2xl font-bold text-emerald-600 mb-2">Text HOME to 741741</p>
                <p className="text-sm text-slate-500">Free, 24/7 support via text message</p>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              <button className="px-6 py-3 rounded-xl bg-rose-500 text-white font-medium shadow-lg shadow-rose-200 hover:bg-rose-600 transition-colors flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Call Now
              </button>
              <button className={`px-6 py-3 rounded-xl bg-white text-slate-700 font-medium shadow-lg hover:shadow-xl transition-all flex items-center gap-2`}>
                <MessageCircle className="w-5 h-5" />
                Chat with Counselor
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Shield, label: 'HIPAA Compliant', desc: 'Your data is protected' },
              { icon: Users, label: 'Licensed Therapists', desc: 'Verified professionals' },
              { icon: Clock, label: '24/7 Support', desc: 'Always here for you' },
              { icon: Heart, label: '98% Satisfaction', desc: 'Users feel supported' },
            ].map((item, index) => (
              <div key={index} className={`p-6 rounded-2xl ${neumorphic.subtle} text-center`}>
                <div className={`w-12 h-12 mx-auto mb-3 rounded-xl ${neumorphic.raised} flex items-center justify-center`}>
                  <item.icon className="w-6 h-6 text-emerald-500" />
                </div>
                <h4 className="font-semibold text-slate-700 mb-1">{item.label}</h4>
                <p className="text-sm text-slate-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-12 px-6 ${neumorphic.raised}`}>
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-xl ${neumorphic.button}`}>
                  <Leaf className="w-6 h-6 text-emerald-500" />
                </div>
                <span className="text-xl font-semibold text-slate-700">MindfulSpace</span>
              </div>
              <p className="text-sm text-slate-500">
                Supporting your mental wellness journey with compassion and expertise.
              </p>
            </div>

            {[
              { title: 'Product', links: ['Features', 'Pricing', 'Testimonials', 'FAQ'] },
              { title: 'Resources', links: ['Blog', 'Guides', 'Webinars', 'Podcasts'] },
              { title: 'Company', links: ['About', 'Careers', 'Contact', 'Privacy'] },
            ].map((section) => (
              <div key={section.title}>
                <h4 className="font-semibold text-slate-700 mb-4">{section.title}</h4>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm text-slate-500 hover:text-emerald-500 transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              © 2026 MindfulSpace. All rights reserved.
            </p>
            <p className="text-sm text-slate-400">
              Made with 💚 for your mental wellness
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
