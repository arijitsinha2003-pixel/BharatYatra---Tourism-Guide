import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp, boolean, doublePrecision } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  displayName: text('display_name'),
  photoURL: text('photo_url'),
  isAdmin: boolean('is_admin').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const destinations = pgTable('destinations', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  state: text('state').notNull().default('India'),
  region: text('region').notNull().default('North India'), // North, West, East, South, Himalayas
  tagline: text('tagline'),
  description: text('description').notNull(),
  location: text('location').notNull(),
  bestTime: text('best_time').notNull(),
  budget: doublePrecision('budget').notNull(), // Estimated budget per person in INR
  image: text('image'),
  idealDuration: text('ideal_duration').default('3-5 Days'),
  famousFor: text('famous_for'), // Culture, Heritage, Cuisine, Wildlife, Nature
  localCuisine: text('local_cuisine'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const touristPlaces = pgTable('tourist_places', {
  id: serial('id').primaryKey(),
  destinationId: integer('destination_id')
    .references(() => destinations.id)
    .notNull(),
  name: text('name').notNull(),
  category: text('category').default('Monument'), // Heritage, Monument, Temple, Scenic, Market
  details: text('details').notNull(),
  openingInfo: text('opening_info'),
  location: text('location'),
  entryFee: text('entry_fee').default('Free'),
  travelTips: text('travel_tips'),
  image: text('image'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const hotels = pgTable('hotels', {
  id: serial('id').primaryKey(),
  destinationId: integer('destination_id')
    .references(() => destinations.id)
    .notNull(),
  name: text('name').notNull(),
  regionName: text('region_name').notNull(), // Kolkata, New Delhi, Rajasthan, Gujarat, Jammu & Kashmir
  category: text('category').notNull().default('Luxury Heritage'), // Luxury Heritage, 5-Star Deluxe, Boutique Resort, Budget Premium
  rating: doublePrecision('rating').notNull().default(4.8),
  pricePerNight: doublePrecision('price_per_night').notNull(), // In INR
  address: text('address').notNull(),
  amenities: text('amenities').notNull(), // Comma-separated or bullet list
  description: text('description').notNull(),
  image: text('image'),
  contactPhone: text('contact_phone').default('+91 1800-258-3690'),
  featured: boolean('featured').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const guides = pgTable('guides', {
  id: serial('id').primaryKey(),
  destinationId: integer('destination_id')
    .references(() => destinations.id)
    .notNull(),
  name: text('name').notNull(),
  regionName: text('region_name').notNull(),
  experienceYears: integer('experience_years').notNull().default(8),
  languages: text('languages').notNull(), // "English, Hindi, Bengali"
  rating: doublePrecision('rating').notNull().default(4.9),
  reviewCount: integer('review_count').default(120),
  pricePerDay: doublePrecision('price_per_day').notNull(), // In INR
  specialty: text('specialty').notNull(),
  bio: text('bio').notNull(),
  photo: text('photo'),
  contactPhone: text('contact_phone').default('+91 98300-11223'),
  certifiedBy: text('certified_by').default('Ministry of Tourism, Govt of India'),
  badge: text('badge').default('Certified Master Guide'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const restaurants = pgTable('restaurants', {
  id: serial('id').primaryKey(),
  destinationId: integer('destination_id')
    .references(() => destinations.id)
    .notNull(),
  regionName: text('region_name').notNull(),
  name: text('name').notNull(),
  cuisineType: text('cuisine_type').notNull(),
  priceForTwo: doublePrecision('price_for_two').notNull(), // In INR
  rating: doublePrecision('rating').notNull().default(4.8),
  address: text('address').notNull(),
  mustTryDishes: text('must_try_dishes').notNull(),
  description: text('description').notNull(),
  timing: text('timing').default('12:00 PM – 11:00 PM'),
  image: text('image'),
  famousFor: text('famous_for'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const packages = pgTable('packages', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  region: text('region').notNull().default('India'),
  description: text('description').notNull(),
  duration: text('duration').notNull(),
  price: doublePrecision('price').notNull(), // In INR
  placesCovered: text('places_covered').notNull(),
  highlights: text('highlights'),
  inclusions: text('inclusions'),
  image: text('image'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const bookings = pgTable('bookings', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  packageId: integer('package_id')
    .references(() => packages.id),
  hotelId: integer('hotel_id')
    .references(() => hotels.id),
  guideId: integer('guide_id')
    .references(() => guides.id),
  bookingType: text('booking_type').default('package'), // 'package', 'hotel', 'guide'
  travelersCount: integer('travelers_count').default(2),
  travelDate: text('travel_date'),
  totalAmount: doublePrecision('total_amount').default(0),
  contactNumber: text('contact_number'),
  specialRequests: text('special_requests'),
  bookingDate: timestamp('booking_date').defaultNow(),
  status: text('status').default('Confirmed'),
});

export const favorites = pgTable('favorites', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  destinationId: integer('destination_id')
    .references(() => destinations.id)
    .notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const contacts = pgTable('contacts', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  destinationInterest: text('destination_interest'),
  subject: text('subject').notNull(),
  message: text('message').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  bookings: many(bookings),
  favorites: many(favorites),
}));

export const destinationsRelations = relations(destinations, ({ many }) => ({
  touristPlaces: many(touristPlaces),
  hotels: many(hotels),
  guides: many(guides),
  restaurants: many(restaurants),
  favorites: many(favorites),
}));

export const touristPlacesRelations = relations(touristPlaces, ({ one }) => ({
  destination: one(destinations, {
    fields: [touristPlaces.destinationId],
    references: [destinations.id],
  }),
}));

export const hotelsRelations = relations(hotels, ({ one, many }) => ({
  destination: one(destinations, {
    fields: [hotels.destinationId],
    references: [destinations.id],
  }),
  bookings: many(bookings),
}));

export const guidesRelations = relations(guides, ({ one, many }) => ({
  destination: one(destinations, {
    fields: [guides.destinationId],
    references: [destinations.id],
  }),
  bookings: many(bookings),
}));

export const restaurantsRelations = relations(restaurants, ({ one }) => ({
  destination: one(destinations, {
    fields: [restaurants.destinationId],
    references: [destinations.id],
  }),
}));

export const packagesRelations = relations(packages, ({ many }) => ({
  bookings: many(bookings),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  user: one(users, {
    fields: [bookings.userId],
    references: [users.id],
  }),
  package: one(packages, {
    fields: [bookings.packageId],
    references: [packages.id],
  }),
  hotel: one(hotels, {
    fields: [bookings.hotelId],
    references: [hotels.id],
  }),
  guide: one(guides, {
    fields: [bookings.guideId],
    references: [guides.id],
  }),
}));

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, {
    fields: [favorites.userId],
    references: [users.id],
  }),
  destination: one(destinations, {
    fields: [favorites.destinationId],
    references: [destinations.id],
  }),
}));
