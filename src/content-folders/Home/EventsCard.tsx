import { eventApi } from "../../features/APIS/EventsApi";
import { mediaApi } from "../../features/APIS/mediaApi";
import { PuffLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  CalendarDays,
  Clock,
  Building,
  MapPin,
  Users,
  Tag,
  Ticket,
} from "lucide-react";
import { ticketApi } from "../../features/APIS/ticketsType.Api";

type Venue = {
  name: string;
  address: string;
  capacity: number;
};

type EventDetails = {
  eventId: number;
  title: string;
  description?: string;
  venue?: Venue;
  category?: string;
  date: string;
  time: string;
  ticketPrice: number | string;
  ticketsTotal: number;
  ticketsSold: number;
};

type TicketTypeData = {
  ticketTypeId: number;
  name: string;
  quantity: number;
  sold: number;
};

export const EventCard = () => {
  const navigate = useNavigate();

  const {
    data: allEvents = [],
    isLoading,
    error,
  } = eventApi.useGetAllEventsQuery({
    pollingInterval: 3000,
  });

  const displayedEvents = allEvents.slice(0, 3);

  return (
    <section className="min-h-screen py-16 px-6 bg-base-100 text-base-content">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-extrabold text-center text-primary mb-6">Upcoming Events</h2>
        <p className="text-lg text-base-content/70 max-w-3xl mx-auto text-center mb-10">
          At <span className="text-primary font-semibold">TicketStream</span>, we bring you the best live entertainment experiences.
        </p>

        {error ? (
          <div className="text-error text-center">Something went wrong.</div>
        ) : isLoading ? (
          <div className="flex justify-center h-64 items-center">
            <PuffLoader color="#06b6d4" />
          </div>
        ) : displayedEvents.length === 0 ? (
          <div className="text-center text-primary text-lg">No events found.</div>
        ) : (
          <div className="grid gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {displayedEvents.map((event: EventDetails) => (
              <EventCardItem key={event.eventId} event={event} navigate={navigate} />
            ))}
          </div>
        )}

        {allEvents.length > 3 && (
          <div className="mt-12 text-center">
            <button
              onClick={() => navigate("/events")}
              className="btn btn-primary btn-wide"
            >
              See More Events
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

const EventCardItem = ({
  event,
  navigate,
}: {
  event: EventDetails;
  navigate: ReturnType<typeof useNavigate>;
}) => {
  const { data: media = [] } = mediaApi.useGetMediaByEventIdQuery(event.eventId);
  const { data: ticketTypes = [] } = ticketApi.useGetTicketTypesByEventIdQuery(event.eventId);

  const firstImage = Array.isArray(media)
    ? media.find((m: any) => m.type === "image")
    : null;

  const price = parseFloat(event.ticketPrice as string);
  const ticketsSold = Number(event.ticketsSold) || 0;
  const ticketsTotal = Number(event.ticketsTotal) || 0;
  const available = ticketsTotal - ticketsSold;

  return (
    <div className="card bg-base-200 shadow-xl hover:shadow-2xl transition-all duration-300">
      {firstImage ? (
        <figure>
          <img
            src={firstImage.url}
            alt={event.title}
            className="w-full h-48 object-cover"
          />
        </figure>
      ) : (
        <div className="w-full h-48 flex items-center justify-center text-primary-content bg-primary/10">
          No Image Available
        </div>
      )}

      <div className="card-body">
        <h3 className="card-title text-primary">{event.title}</h3>
        <p className="text-success font-bold text-lg">
          Ksh{isNaN(price) ? "0.00" : price.toFixed(2)}
        </p>
        <p className="text-base-content/70 line-clamp-3">
          {event.description || "No description available."}
        </p>

        <div className="grid grid-cols-2 gap-3 text-sm text-base-content/80 border border-base-300 rounded-lg p-4 mt-4 bg-base-100">
          <div className="flex items-center gap-2"><CalendarDays className="w-4 h-4 text-primary" /><span>{event.date}</span></div>
          <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /><span>{event.time}</span></div>
          <div className="flex items-center gap-2"><Building className="w-4 h-4 text-primary" /><span>{event.venue?.name || "N/A"}</span></div>
          <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /><span>{event.venue?.address || "N/A"}</span></div>
          <div className="flex items-center gap-2"><Users className="w-4 h-4 text-primary" /><span>{event.venue?.capacity ?? "N/A"}</span></div>
          <div className="flex items-center gap-2"><Tag className="w-4 h-4 text-primary" /><span>{event.category || "Uncategorized"}</span></div>
          <div className="flex items-center gap-2"><Ticket className="w-4 h-4 text-primary" /><span>Sold: {ticketsSold}</span></div>
          <div className="flex items-center gap-2"><Ticket className="w-4 h-4 text-primary" /><span>Available: {available}</span></div>
        </div>

        {ticketTypes.length > 0 && (
          <div className="mt-4">
            <h4 className="text-base font-semibold mb-2 text-primary">Ticket Types</h4>
            <ul className="space-y-1 text-sm">
              {ticketTypes.map((type: TicketTypeData) => {
                const sold = Number(type.sold) || 0;
                const available = Number(type.quantity) - sold;

                return (
                  <li key={type.ticketTypeId} className="flex justify-between">
                    <span>{type.name}</span>
                    <span>Sold: {sold}</span>
                    <span>Available: {available}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <div className="card-actions mt-4">
          <button
            onClick={() => navigate(`/events/${event.eventId}`)}
            className="btn btn-primary w-full"
            disabled={available <= 0}
          >
            <ShoppingCart className="w-5 h-5" />
            {available <= 0 ? "Sold Out" : "Book Now"}
          </button>
        </div>
      </div>
    </div>
  );
};
