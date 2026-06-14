import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  format, addMonths, subMonths, startOfMonth, endOfMonth, 
  startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, parseISO 
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Sparkles, Image as ImageIcon, Download, Copy, Check } from 'lucide-react';
import './SmartCalender.css';

const SmartCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loadingEvents, setLoadingEvents] = useState(false);
  
  // Poster Generation State
  const [generating, setGenerating] = useState(false);
  const [posterData, setPosterData] = useState(null);
  const [selectedEventToGenerate, setSelectedEventToGenerate] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  const fetchEvents = async () => {
    setLoadingEvents(true);
    try {
      const year = format(currentDate, 'yyyy');
      const month = format(currentDate, 'MM');
const response = await axios.get(
  `http://localhost:5000/api/calendar/events?year=${year}&month=${month}`
);
      if (response.data.success) {
        setEvents(response.data.events);
      }
    } catch (error) {
      console.error("Failed to fetch events", error);
    } finally {
      setLoadingEvents(false);
    }
  };

  const handleGeneratePoster = async (event) => {
    setGenerating(true);
    setPosterData(null);
    setSelectedEventToGenerate(event.id || event.title);
    try {
      const response = await axios.post('http://localhost:5000/api/poster/generate-poster', {
        eventTitle: event.title,
        eventType: event.type,
        date: event.date
      });
      if (response.data.success) {
        setPosterData(response.data);
      }
    } catch (error) {
      console.error("Poster generation failed", error);
      alert("Failed to generate poster. Make sure backend is running.");
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (posterData?.caption) {
      navigator.clipboard.writeText(posterData.caption);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Calendar render logic
  const renderHeader = () => {
    return (
      <div className="header row flex-middle">
        <div className="col col-start">
          <div className="icon" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
            <ChevronLeft />
          </div>
        </div>
        <div className="col col-center">
          <span className="gradient-text title">
            {format(currentDate, "MMMM yyyy")}
          </span>
        </div>
        <div className="col col-end" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
          <div className="icon">
            <ChevronRight />
          </div>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const dateFormat = "EEEE";
    const days = [];
    let startDate = startOfWeek(currentDate);

    for (let i = 0; i < 7; i++) {
      days.push(
        <div className="col col-center day-name" key={i}>
          {format(addDays(startDate, i), dateFormat)}
        </div>
      );
    }
    return <div className="days row">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dateFormat = "d";
    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, dateFormat);
        const cloneDay = day;
        
        // Find events for this day
        const dayEvents = events.filter(e => e.date === format(cloneDay, 'yyyy-MM-dd'));

        days.push(
          <div
            className={`col cell ${
              !isSameMonth(day, monthStart)
                ? "disabled"
                : isSameDay(day, selectedDate) ? "selected" : ""
            }`}
            key={day}
            onClick={() => {
                setSelectedDate(cloneDay);
                setPosterData(null); // reset poster on new day
            }}
          >
            <span className="number">{formattedDate}</span>
            <div className="event-dots">
              {dayEvents.map((evt, idx) => (
                <div key={idx} className={`dot \${evt.type}`}></div>
              ))}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="row" key={day}>
          {days}
        </div>
      );
      days = [];
    }
    return <div className="body">{rows}</div>;
  };

  const forceDownload = async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (e) {
      console.error("Download failed, opening in new tab", e);
      window.open(url, '_blank');
    }
  };

  // Sidebar logic
  const selectedDayEvents = events.filter(e => e.date === format(selectedDate, 'yyyy-MM-dd'));

  return (
    <div className="smart-calendar-container">
      <div className="calendar-main glass-card">
        {renderHeader()}
        {renderDays()}
        {loadingEvents ? <div className="loading-grid">Loading AI Events...</div> : renderCells()}
      </div>

      <div className="sidebar glass-card">
        <h2 className="sidebar-title">
          <CalendarIcon size={20} className="icon-mr" />
          {format(selectedDate, "MMMM do, yyyy")}
        </h2>
        
        <div className="events-list">
          {selectedDayEvents.length === 0 ? (
            <p className="no-events">No major events today. Perfect day for a club meeting!</p>
          ) : (
            selectedDayEvents.map((event, idx) => (
              <div key={idx} className={`event-card \${event.type}-border`}>
                <div className="event-header">
                  <span className={`event-badge \${event.type}`}>{event.type.toUpperCase()}</span>
                  <h3>{event.title}</h3>
                </div>
                <p className="event-desc">{event.description}</p>
                
                <button 
                  className="btn-glow mt-3" 
                  onClick={() => handleGeneratePoster(event)}
                  disabled={generating}
                >
                  <Sparkles size={16} />
                  {generating && selectedEventToGenerate === (event.id || event.title) ? 'Generating Magic...' : 'Generate Poster'}
                </button>
              </div>
            ))
          )}
        </div>

        {/* Poster Result Area */}
        {generating && (
          <div className="poster-result">
            <div className="skeleton poster-skeleton"></div>
            <div className="skeleton text-skeleton"></div>
            <div className="skeleton text-skeleton short"></div>
          </div>
        )}

        {posterData && !generating && (
          <div className="poster-result fade-in">
            <h3 className="result-title"><ImageIcon size={18} className="icon-mr"/> Your AI Poster</h3>
            <div className="img-container">
              <img src={posterData.imageUrl} alt="Generated Poster" className="generated-img" />
              <button className="download-btn" onClick={() => forceDownload(posterData.imageUrl, 'Rotaract_Event_Poster.png')} title="Download Image">
                <Download size={16} />
              </button>
            </div>
            
            <div className="caption-box">
              <p>{posterData.caption}</p>
              <button className="copy-btn" onClick={copyToClipboard} title="Copy Caption">
                {copied ? <Check size={16} color="#4facfe" /> : <Copy size={16} />}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartCalendar;
