import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { db } from './src/db/index.ts';
import { 
  destinations, 
  touristPlaces, 
  hotels,
  guides,
  restaurants,
  packages, 
  contacts, 
  users, 
  bookings, 
  favorites 
} from './src/db/schema.ts';
import { eq, and, desc, sql } from 'drizzle-orm';
import { requireAuth, AuthRequest } from './src/middleware/auth.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const isProd = process.env.NODE_ENV === 'production';
const port = process.env.PORT || 3000;

async function bootstrap() {
  let vite: any;
  if (!isProd) {
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
  }

  // ==========================
  // Public Tourism API Routes
  // ==========================

  // Get Destinations
  app.get('/api/destinations', async (req, res) => {
    try {
      const { region, search } = req.query;
      const data = await db.select().from(destinations);
      
      let filtered = data;
      if (region && region !== 'All') {
        filtered = filtered.filter(d => d.region.toLowerCase() === (region as string).toLowerCase() || d.name.toLowerCase().includes((region as string).toLowerCase()));
      }
      if (search) {
        const q = (search as string).toLowerCase();
        filtered = filtered.filter(d => 
          d.name.toLowerCase().includes(q) || 
          d.location.toLowerCase().includes(q) || 
          d.state.toLowerCase().includes(q) ||
          (d.famousFor && d.famousFor.toLowerCase().includes(q))
        );
      }
      res.json(filtered);
    } catch (error) {
      console.error('Fetch destinations error:', error);
      res.status(500).json({ error: 'Failed to fetch destinations' });
    }
  });

  // Destination Details with attractions, hotels, guides & restaurants
  app.get('/api/destinations/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const destList = await db.select().from(destinations).where(eq(destinations.id, id));
      if (destList.length === 0) return res.status(404).json({ error: 'Destination not found' });
      
      const places = await db.select().from(touristPlaces).where(eq(touristPlaces.destinationId, id));
      const regionHotels = await db.select().from(hotels).where(eq(hotels.destinationId, id));
      const regionGuides = await db.select().from(guides).where(eq(guides.destinationId, id));
      const regionRestaurants = await db.select().from(restaurants).where(eq(restaurants.destinationId, id));
      
      res.json({ 
        ...destList[0], 
        touristPlaces: places,
        hotels: regionHotels,
        guides: regionGuides,
        restaurants: regionRestaurants
      });
    } catch (error) {
      console.error('Fetch destination details error:', error);
      res.status(500).json({ error: 'Failed to fetch destination details' });
    }
  });

  // Get Hotels
  app.get('/api/hotels', async (req, res) => {
    try {
      const { region, destinationId, category } = req.query;
      let data = await db.select().from(hotels);

      if (region && region !== 'All') {
        data = data.filter(h => h.regionName.toLowerCase().includes((region as string).toLowerCase()));
      }
      if (destinationId) {
        data = data.filter(h => h.destinationId === parseInt(destinationId as string));
      }
      if (category && category !== 'All') {
        data = data.filter(h => h.category.toLowerCase() === (category as string).toLowerCase());
      }

      res.json(data);
    } catch (error) {
      console.error('Fetch hotels error:', error);
      res.status(500).json({ error: 'Failed to fetch hotels' });
    }
  });

  // Get Tourism Guides
  app.get('/api/guides', async (req, res) => {
    try {
      const { region, destinationId, search } = req.query;
      let data = await db.select().from(guides);

      if (region && region !== 'All') {
        data = data.filter(g => g.regionName.toLowerCase().includes((region as string).toLowerCase()));
      }
      if (destinationId) {
        data = data.filter(g => g.destinationId === parseInt(destinationId as string));
      }
      if (search) {
        const q = (search as string).toLowerCase();
        data = data.filter(g => 
          g.name.toLowerCase().includes(q) || 
          g.specialty.toLowerCase().includes(q) ||
          g.languages.toLowerCase().includes(q)
        );
      }

      res.json(data);
    } catch (error) {
      console.error('Fetch guides error:', error);
      res.status(500).json({ error: 'Failed to fetch tourism guides' });
    }
  });

  // Get Restaurants & Food
  app.get('/api/restaurants', async (req, res) => {
    try {
      const { region, destinationId, search } = req.query;
      let data = await db.select().from(restaurants);

      if (region && region !== 'All') {
        data = data.filter(r => r.regionName.toLowerCase().includes((region as string).toLowerCase()));
      }
      if (destinationId) {
        data = data.filter(r => r.destinationId === parseInt(destinationId as string));
      }
      if (search) {
        const q = (search as string).toLowerCase();
        data = data.filter(r => 
          r.name.toLowerCase().includes(q) || 
          r.cuisineType.toLowerCase().includes(q) ||
          r.mustTryDishes.toLowerCase().includes(q)
        );
      }

      res.json(data);
    } catch (error) {
      console.error('Fetch restaurants error:', error);
      res.status(500).json({ error: 'Failed to fetch restaurants' });
    }
  });

  // Get Tourist Places
  app.get('/api/tourist-places', async (req, res) => {
    try {
      const { search } = req.query;
      let data = await db.select().from(touristPlaces);
      if (search) {
        const q = (search as string).toLowerCase();
        data = data.filter(p => p.name.toLowerCase().includes(q) || p.details.toLowerCase().includes(q) || p.location?.toLowerCase().includes(q));
      }
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch tourist places' });
    }
  });

  // Get Travel Packages
  app.get('/api/packages', async (req, res) => {
    try {
      const { region } = req.query;
      let data = await db.select().from(packages);
      if (region && region !== 'All') {
        data = data.filter(p => p.region.toLowerCase().includes((region as string).toLowerCase()) || p.name.toLowerCase().includes((region as string).toLowerCase()));
      }
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch packages' });
    }
  });

  // Save Contact / Inquiry
  app.post('/api/contact', async (req, res) => {
    try {
      const { name, email, phone, destinationInterest, subject, message } = req.body;
      if (!name || !email || !subject || !message) {
        return res.status(400).json({ error: 'Please fill in all required fields' });
      }
      await db.insert(contacts).values({ 
        name, 
        email, 
        phone: phone || '', 
        destinationInterest: destinationInterest || 'General Inquiry',
        subject, 
        message 
      });
      res.json({ success: true, message: 'Namaste! Your inquiry has been received. Our India Travel Specialist will reach out within 24 hours.' });
    } catch (error) {
      console.error('Contact form error:', error);
      res.status(500).json({ error: 'Failed to save contact message' });
    }
  });

  // Global Explorer Stats
  app.get('/api/stats', async (req, res) => {
    try {
      const destCount = await db.select({ count: sql<number>`count(*)` }).from(destinations);
      const hotelCount = await db.select({ count: sql<number>`count(*)` }).from(hotels);
      const guideCount = await db.select({ count: sql<number>`count(*)` }).from(guides);
      const restaurantCount = await db.select({ count: sql<number>`count(*)` }).from(restaurants);
      const pkgCount = await db.select({ count: sql<number>`count(*)` }).from(packages);

      res.json({
        destinations: Number(destCount[0]?.count || 0),
        hotels: Number(hotelCount[0]?.count || 0),
        guides: Number(guideCount[0]?.count || 0),
        restaurants: Number(restaurantCount[0]?.count || 0),
        packages: Number(pkgCount[0]?.count || 0)
      });
    } catch (error) {
      res.json({ destinations: 5, hotels: 20, guides: 10, restaurants: 15, packages: 5 });
    }
  });

  // ==========================
  // Protected User Routes
  // ==========================

  app.post('/api/sync-user', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { email, uid, displayName, photoURL } = req.user!;
      const existing = await db.select().from(users).where(eq(users.uid, uid));
      
      if (existing.length === 0) {
        await db.insert(users).values({ 
          uid, 
          email: email || '', 
          displayName: displayName || email?.split('@')[0], 
          photoURL: photoURL || ''
        });
      } else {
        await db.update(users).set({ 
          displayName: displayName || email?.split('@')[0], 
          photoURL: photoURL || ''
        }).where(eq(users.uid, uid));
      }
      const user = await db.select().from(users).where(eq(users.uid, uid));
      res.json(user[0]);
    } catch (error) {
      res.status(500).json({ error: 'Failed to sync user' });
    }
  });

  // Create Booking (Package, Hotel, or Guide)
  app.post('/api/bookings', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { 
        packageId, 
        hotelId, 
        guideId,
        bookingType, 
        travelersCount, 
        travelDate, 
        totalAmount, 
        contactNumber, 
        specialRequests 
      } = req.body;

      const user = await db.select().from(users).where(eq(users.uid, req.user!.uid));
      if (user.length === 0) return res.status(404).json({ error: 'User record not found' });

      const newBooking = await db.insert(bookings).values({
        userId: user[0].id,
        packageId: packageId ? parseInt(packageId) : null,
        hotelId: hotelId ? parseInt(hotelId) : null,
        guideId: guideId ? parseInt(guideId) : null,
        bookingType: bookingType || 'package',
        travelersCount: travelersCount ? parseInt(travelersCount) : 2,
        travelDate: travelDate || new Date().toISOString().split('T')[0],
        totalAmount: totalAmount ? parseFloat(totalAmount) : 0,
        contactNumber: contactNumber || '',
        specialRequests: specialRequests || '',
        status: 'Confirmed'
      }).returning();

      res.json({ success: true, booking: newBooking[0] });
    } catch (error) {
      console.error('Booking error:', error);
      res.status(500).json({ error: 'Failed to create booking' });
    }
  });

  // Get My Bookings with detailed hotel, package & guide information
  app.get('/api/my-bookings', requireAuth, async (req: AuthRequest, res) => {
    try {
      const user = await db.select().from(users).where(eq(users.uid, req.user!.uid));
      if (user.length === 0) return res.status(404).json({ error: 'User not found' });

      const userBookings = await db.select().from(bookings).where(eq(bookings.userId, user[0].id)).orderBy(desc(bookings.bookingDate));
      
      const allPkgs = await db.select().from(packages);
      const allHotels = await db.select().from(hotels);
      const allGuides = await db.select().from(guides);

      const enriched = userBookings.map(b => {
        const pkg = b.packageId ? allPkgs.find(p => p.id === b.packageId) : null;
        const hotel = b.hotelId ? allHotels.find(h => h.id === b.hotelId) : null;
        const guide = b.guideId ? allGuides.find(g => g.id === b.guideId) : null;
        return {
          ...b,
          package: pkg,
          hotel: hotel,
          guide: guide
        };
      });

      res.json(enriched);
    } catch (error) {
      console.error('My bookings error:', error);
      res.status(500).json({ error: 'Failed to fetch bookings' });
    }
  });

  // Toggle Favorite Destination
  app.post('/api/favorites/toggle', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { destinationId } = req.body;
      const user = await db.select().from(users).where(eq(users.uid, req.user!.uid));
      if (user.length === 0) return res.status(404).json({ error: 'User not found' });

      const destId = parseInt(destinationId);
      const existing = await db.select().from(favorites).where(
        and(eq(favorites.userId, user[0].id), eq(favorites.destinationId, destId))
      );

      if (existing.length > 0) {
        await db.delete(favorites).where(
          and(eq(favorites.userId, user[0].id), eq(favorites.destinationId, destId))
        );
        res.json({ favorited: false });
      } else {
        await db.insert(favorites).values({
          userId: user[0].id,
          destinationId: destId
        });
        res.json({ favorited: true });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to toggle favorite' });
    }
  });

  // Get My Favorites
  app.get('/api/favorites', requireAuth, async (req: AuthRequest, res) => {
    try {
      const user = await db.select().from(users).where(eq(users.uid, req.user!.uid));
      if (user.length === 0) return res.status(404).json({ error: 'User not found' });

      const favs = await db.select().from(favorites).where(eq(favorites.userId, user[0].id));
      const favDestIds = favs.map(f => f.destinationId);
      
      if (favDestIds.length === 0) return res.json([]);

      const allDests = await db.select().from(destinations);
      const favoriteDests = allDests.filter(d => favDestIds.includes(d.id));

      res.json(favoriteDests);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch favorites' });
    }
  });

  // ==========================================
  // Comprehensive Indian Tourism Seed Endpoint
  // ==========================================
  app.post('/api/seed', async (req, res) => {
    try {
      // Clear old data to cleanly reseed
      await db.delete(bookings);
      await db.delete(favorites);
      await db.delete(hotels);
      await db.delete(guides);
      await db.delete(restaurants);
      await db.delete(touristPlaces);
      await db.delete(packages);
      await db.delete(destinations);

      // 1. Seed Destinations
      const seededDestinations = await db.insert(destinations).values([
        {
          name: 'Kolkata',
          state: 'West Bengal',
          region: 'East India',
          tagline: 'The City of Joy, Intellectual Soul & Grand Colonial Architecture',
          description: 'Kolkata, the cultural capital of India, is an enchanting tapestry of stately Victorian architecture, artistic cafes, heritage yellow taxis, and the serene Hooghly River. Famous for the magnificent Victoria Memorial, Howrah Bridge, grand Durga Puja festivities, and delectable culinary delights.',
          location: 'West Bengal, Eastern India',
          bestTime: 'October to March (Pleasant winters)',
          budget: 12000,
          idealDuration: '3-4 Days',
          famousFor: 'Heritage, Art, Literature, Street Food, Colonial Monuments',
          localCuisine: 'Kolkata Biryani, Rosogolla, Mishti Doi, Kosha Mangsho, Puchka',
          image: 'https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=1200&q=80'
        },
        {
          name: 'New Delhi',
          state: 'National Capital Territory',
          region: 'North India',
          tagline: 'Heart of India, Imperial Monuments & Vibrant Bazaars',
          description: 'India\'s historic capital seamlessly weaves centuries of Mughal and British imperial history with modern cosmopolitan vigor. From the towering Qutub Minar, monumental India Gate, and sprawling Red Fort to the narrow bustling spices lanes of Old Delhi’s Chandni Chowk.',
          location: 'Delhi NCR, Northern India',
          bestTime: 'October to March (Crisp pleasant weather)',
          budget: 18000,
          idealDuration: '3-5 Days',
          famousFor: 'Mughal Architecture, World Heritage Sites, Street Food, Shopping',
          localCuisine: 'Chole Bhature, Butter Chicken, Chandni Chowk Parathas, Chaat',
          image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80'
        },
        {
          name: 'Rajasthan (Jaipur, Udaipur & Jaisalmer)',
          state: 'Rajasthan',
          region: 'West India',
          tagline: 'Land of Kings, Majestic Forts, Golden Deserts & Royal Palaces',
          description: 'Rajasthan is an opulent dreamscape of royal Rajput heritage. Marvel at the pink-hued Amber Fort & Hawa Mahal in Jaipur, romantic shimmering waters of Lake Pichola in Udaipur, and golden sandstone fortress & camel dunes of Jaisalmer.',
          location: 'Rajasthan, Western India',
          bestTime: 'October to March (Warm sunny days & cool desert nights)',
          budget: 25000,
          idealDuration: '6-8 Days',
          famousFor: 'Palaces, Desert Safaris, Folk Music, Royal Heritage, Handicrafts',
          localCuisine: 'Dal Baati Churma, Laal Maas, Ker Sangri, Ghevar, Pyaaz Kachori',
          image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80'
        },
        {
          name: 'Gujarat (Kutch, Ahmedabad & Gir)',
          state: 'Gujarat',
          region: 'West India',
          tagline: 'Vibrant Heritage, White Desert of Kutch & Asiatic Lions',
          description: 'Gujarat presents an extraordinary spectrum of experiences: the endless shimmering white salt expanse of Rann of Kutch during Rann Utsav, the architectural marvel of the Statue of Unity, Asiatic lions in Gir National Park, and the UNESCO World Heritage walled city of Ahmedabad.',
          location: 'Gujarat, Western India',
          bestTime: 'November to February (Rann Utsav season)',
          budget: 20000,
          idealDuration: '5-7 Days',
          famousFor: 'Rann Utsav, Wildlife, UNESCO Heritage, Textile Arts, Temples',
          localCuisine: 'Gujarati Royal Thali, Khaman Dhokla, Khandvi, Undhiyu, Fafda Jalebi',
          image: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=1200&q=80'
        },
        {
          name: 'Jammu & Kashmir (Srinagar, Gulmarg & Pahalgam)',
          state: 'Jammu & Kashmir',
          region: 'Himalayas',
          tagline: 'Heaven on Earth, Pristine Valleys, Snow Slopes & Shikara Rides',
          description: 'Encircled by the snow-crested Pir Panjal and Himalayan ranges, Kashmir is eternal paradise. Glide in a painted Shikara on Dal Lake, stay in a carved cedar houseboat, ride the world’s second highest cable car in Gulmarg, and trek through pine meadows in Pahalgam.',
          location: 'Jammu & Kashmir, Northern Himalayas',
          bestTime: 'April to October (Lush blooms) & Dec to Feb (Snow & Skiing)',
          budget: 28000,
          idealDuration: '5-7 Days',
          famousFor: 'Dal Lake Houseboats, Gulmarg Skiing, Mughal Gardens, Pashmina, Saffron',
          localCuisine: 'Kashmiri Wazwan, Rogan Josh, Kahwa Tea, Gushtaba, Dum Aloo',
          image: 'https://images.unsplash.com/photo-1566837945700-30057527ade0?auto=format&fit=crop&w=1200&q=80'
        }
      ]).returning();

      const [kolkata, delhi, rajasthan, gujarat, kashmir] = seededDestinations;

      // 2. Seed Tourist Places
      await db.insert(touristPlaces).values([
        // Kolkata Attractions
        {
          destinationId: kolkata.id,
          name: 'Victoria Memorial Hall',
          category: 'Monument & Museum',
          details: 'A magnificent white Makrana marble monument dedicated to Queen Victoria, surrounded by 64 acres of lush gardens and housing royal British and Bengal Renaissance art.',
          openingInfo: '10:00 AM – 5:00 PM (Tuesday to Sunday)',
          location: 'Queens Way, Maidan, Kolkata',
          entryFee: '₹50 (Indian Nationals)',
          travelTips: 'Visit during late afternoon to catch the breathtaking sunset illumination and the evening Sound & Light show.',
          image: 'https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=800&q=80'
        },
        {
          destinationId: kolkata.id,
          name: 'Howrah Bridge (Rabindra Setu)',
          category: 'Iconic Landmark',
          details: 'The iconic cantilever bridge over the Hooghly River constructed without nuts and bolts, serving as the bustling lifeline of Kolkata since 1943.',
          openingInfo: 'Open 24/7 (Best viewed at dawn or illuminated at night)',
          location: 'Hooghly River, connecting Kolkata and Howrah',
          entryFee: 'Free entry',
          travelTips: 'Take a ferry ride from Princep Ghat or Babughat for panoramic views of the colossal steel structure.',
          image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80'
        },
        {
          destinationId: kolkata.id,
          name: 'Dakshineswar & Belur Math',
          category: 'Spiritual Heritage',
          details: 'The historic 19th-century Navaratna style Kali temple where mystic Ramakrishna Paramahamsa meditated, facing Swami Vivekananda’s Belur Math across the river.',
          openingInfo: '6:00 AM – 12:30 PM, 3:30 PM – 8:30 PM',
          location: 'Dakshineswar, North 24 Parganas, Hooghly Bank',
          entryFee: 'Free entry',
          travelTips: 'Board a scenic 15-minute river launch from Dakshineswar ghat directly to Belur Math across the river.',
          image: 'https://images.unsplash.com/photo-1628172909405-b04066c61ca8?auto=format&fit=crop&w=800&q=80'
        },

        // Delhi Attractions
        {
          destinationId: delhi.id,
          name: 'India Gate & Kartavya Path',
          category: 'War Memorial',
          details: 'A 42-meter high triumphal arch honoring 84,000 Indian soldiers, set against the stately backdrop of Rashtrapati Bhavan and illuminated grand lawns.',
          openingInfo: 'Open 24/7 (Best during evening twilight)',
          location: 'Rajpath / Kartavya Path, Central Delhi',
          entryFee: 'Free entry',
          travelTips: 'Enjoy evening strolls with local street ice cream vendors and views of the Amar Jawan Jyoti.',
          image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80'
        },
        {
          destinationId: delhi.id,
          name: 'Qutub Minar Complex',
          category: 'UNESCO World Heritage',
          details: 'A 73-meter high fluted red sandstone victory tower built in 1192 AD, featuring the 1600-year-old rust-resistant Iron Pillar of Delhi and intricate calligraphic carvings.',
          openingInfo: '7:00 AM – 5:00 PM Daily',
          location: 'Mehrauli, South Delhi',
          entryFee: '₹50 (Indians), ₹600 (Foreigners)',
          travelTips: 'Visit early in the morning for soft photographic light and fewer tourist crowds.',
          image: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80'
        },
        {
          destinationId: delhi.id,
          name: 'Red Fort & Chandni Chowk',
          category: 'Mughal Fortress & Bazaar',
          details: 'The colossal 17th-century Mughal imperial palace fortress built by Emperor Shah Jahan, situated right across from Asia’s largest spice market.',
          openingInfo: '9:30 AM – 4:30 PM (Closed Mondays)',
          location: 'Netaji Subhash Marg, Old Delhi',
          entryFee: '₹50 (Indians)',
          travelTips: 'Take a cycle rickshaw ride through the buzzing lanes of Khari Baoli spice market and Paranthe Wali Gali.',
          image: 'https://images.unsplash.com/photo-1597042780497-2a21e06d9a93?auto=format&fit=crop&w=800&q=80'
        },

        // Rajasthan Attractions
        {
          destinationId: rajasthan.id,
          name: 'Amber Fort & Sheesh Mahal (Jaipur)',
          category: 'Royal Hill Fort',
          details: 'Perched on high rugged hills above Maota Lake, famous for its Sheesh Mahal (Mirror Palace) where a single candle flame illuminates the entire chamber.',
          openingInfo: '8:00 AM – 5:30 PM, Night view 6:30 PM – 9:15 PM',
          location: 'Amer, 11 km from Jaipur City Center',
          entryFee: '₹100 (Indians)',
          travelTips: 'Hire an authorized government guide to discover the secret underground escape tunnels leading to Jaigarh Fort.',
          image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80'
        },
        {
          destinationId: rajasthan.id,
          name: 'City Palace & Lake Pichola (Udaipur)',
          category: 'Heritage Palace Complex',
          details: 'A breathtaking series of granite and marble palaces on the tranquil banks of Lake Pichola, showcasing peacock mosaics and hanging gardens.',
          openingInfo: '9:30 AM – 5:30 PM Daily',
          location: 'Old City, Udaipur',
          entryFee: '₹300 (Palace Entry)',
          travelTips: 'Pre-book a sunset boat ride around Lake Pichola for spellbinding views of Jag Mandir and the Lake Palace.',
          image: 'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&w=800&q=80'
        },

        // Gujarat Attractions
        {
          destinationId: gujarat.id,
          name: 'Great Rann of Kutch (White Desert)',
          category: 'Natural Salt Wonder',
          details: 'The world\'s largest salt desert transforming into a magical white moonlit wonderland during winter Rann Utsav with folk music, artisan bazaars, and luxury tent cities.',
          openingInfo: 'Open during winter (Nov – Feb best experienced)',
          location: 'Dhordo, Kutch District, Gujarat',
          entryFee: '₹100 permit per person',
          travelTips: 'Plan your visit on Full Moon Night when the endless white crystals reflect ethereal silver moonlight.',
          image: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=800&q=80'
        },
        {
          destinationId: gujarat.id,
          name: 'Statue of Unity (Kevadia)',
          category: 'World Wonder Monument',
          details: 'The tallest statue in the world (182 meters) dedicated to Sardar Vallabhbhai Patel, offering high-speed elevators to the 153-meter high chest viewing gallery.',
          openingInfo: '8:00 AM – 6:00 PM (Closed Mondays)',
          location: 'Kevadia, Narmada District',
          entryFee: '₹150 – ₹380',
          travelTips: 'Book the evening Laser Light and Sound Show in advance along with the Valley of Flowers tour.',
          image: 'https://images.unsplash.com/photo-1629814696225-83214532bfa5?auto=format&fit=crop&w=800&q=80'
        },

        // Kashmir Attractions
        {
          destinationId: kashmir.id,
          name: 'Dal Lake & Floating Flower Market',
          category: 'Scenic Lake & Heritage',
          details: 'The jewel of Srinagar spanning 18 sq km, dotted with vibrant wooden Shikaras, floating vegetable markets at dawn, and heritage carved cedar houseboats.',
          openingInfo: 'Shikara rides available 5:30 AM – 8:30 PM',
          location: 'Boulevard Road, Srinagar',
          entryFee: '₹700 – ₹1,200 per Shikara hour ride',
          travelTips: 'Wake up at 5:30 AM for the legendary floating wholesale flower and vegetable market in the lake backwaters.',
          image: 'https://images.unsplash.com/photo-1566837945700-30057527ade0?auto=format&fit=crop&w=800&q=80'
        },
        {
          destinationId: kashmir.id,
          name: 'Gulmarg Gondola & Apharwat Peak',
          category: 'Alpine Snow & Skiing',
          details: 'The world\'s highest operating cable car reaching 13,780 ft on Apharwat Peak, offering world-class powder snow skiing in winter and lush alpine meadows in summer.',
          openingInfo: '9:00 AM – 5:00 PM (Weather permitting)',
          location: 'Gulmarg, Baramulla District (50 km from Srinagar)',
          entryFee: 'Phase 1: ₹800, Phase 2: ₹1,000',
          travelTips: 'Gondola Phase 2 tickets sell out weeks in advance online; ensure early reservation.',
          image: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=800&q=80'
        }
      ]);

      // 3. Seed Regional Hotels
      await db.insert(hotels).values([
        // Kolkata Hotels
        {
          destinationId: kolkata.id,
          name: 'The Oberoi Grand Kolkata',
          regionName: 'Kolkata, West Bengal',
          category: 'Luxury Heritage',
          rating: 4.9,
          pricePerNight: 14500,
          address: '15 Jawaharlal Nehru Road, Chowringhee, Central Kolkata',
          amenities: 'Outdoor Pool, Heritage Spa, Thai Pavilion, 24/7 Butler, Fitness Center, Free Wi-Fi',
          description: 'Affectionately known as the "Grande Dame of Chowringhee", combining Victorian grandeur with world-class personalized service.',
          image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
          contactPhone: '+91 33 2249 2323',
          featured: true
        },
        {
          destinationId: kolkata.id,
          name: 'ITC Royal Bengal & ITC Sonar',
          regionName: 'Kolkata, West Bengal',
          category: '5-Star Deluxe',
          rating: 4.8,
          pricePerNight: 12800,
          address: '1 JBS Haldane Avenue, EM Bypass, Kolkata',
          amenities: 'Kaya Kalp Royal Spa, Peshawri Dining, Grand Ballroom, Infinity Pool, Valet Parking',
          description: 'A monument to modern Bengali aristocracy, boasting palatial architecture and award-winning dining restaurants.',
          image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
          contactPhone: '+91 33 4446 4646',
          featured: true
        },

        // Delhi Hotels
        {
          destinationId: delhi.id,
          name: 'The Imperial, New Delhi',
          regionName: 'New Delhi',
          category: 'Luxury Heritage',
          rating: 4.9,
          pricePerNight: 22000,
          address: 'Janpath Lane, Connaught Place, New Delhi',
          amenities: 'Imperial Spa, 1911 Bar, Art Deco Galleries, Temperature Controlled Pool, French Dining',
          description: 'A legendary 1930s Art Deco masterpiece celebrated as India’s finest museum hotel, housing rare British-India art collections in Connaught Place.',
          image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
          contactPhone: '+91 11 2334 1234',
          featured: true
        },
        {
          destinationId: delhi.id,
          name: 'The Leela Palace New Delhi',
          regionName: 'New Delhi',
          category: '5-Star Deluxe',
          rating: 4.9,
          pricePerNight: 25500,
          address: 'Diplomatic Enclave, Chanakyapuri, New Delhi',
          amenities: 'Rooftop Heated Infinity Pool, ESPA Luxury Spa, MEGU Japanese Dining, Butler Service',
          description: 'An ode to Lutyens architecture with palatial Indian motifs, Murano chandeliers, and Michelin-caliber gastronomic offerings.',
          image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
          contactPhone: '+91 11 3933 1234',
          featured: true
        },

        // Rajasthan Hotels
        {
          destinationId: rajasthan.id,
          name: 'Rambagh Palace, Jaipur (Taj)',
          regionName: 'Jaipur, Rajasthan',
          category: 'Royal Heritage Palace',
          rating: 5.0,
          pricePerNight: 45000,
          address: 'Bhawani Singh Road, Jaipur, Rajasthan',
          amenities: 'Royal Peacock Gardens, Polo Bar, Jiva Grande Spa, Royal Carriage Arrival, Vintage Car Fleet',
          description: 'Former residence of the Maharaja of Jaipur, ranked consistently among the world’s top heritage palace hotels.',
          image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
          contactPhone: '+91 141 2211 919',
          featured: true
        },
        {
          destinationId: rajasthan.id,
          name: 'Taj Lake Palace, Udaipur',
          regionName: 'Udaipur, Rajasthan',
          category: 'Royal Heritage Palace',
          rating: 5.0,
          pricePerNight: 42000,
          address: 'P.O. Box No. 5, Lake Pichola, Udaipur, Rajasthan',
          amenities: 'Private Boat Transfers, Floating Jiva Spa Boat, Mewar Fine Dining, Sunset Terraces',
          description: 'A 275-year-old marble palace floating like a white jewel in the center of Lake Pichola.',
          image: 'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&w=800&q=80',
          contactPhone: '+91 294 2428 800',
          featured: true
        },

        // Gujarat Hotels
        {
          destinationId: gujarat.id,
          name: 'Statue of Unity Tent City 1 (Narmada)',
          regionName: 'Narmada, Gujarat',
          category: 'Luxury Eco Resort',
          rating: 4.8,
          pricePerNight: 9500,
          address: 'Near Dyke 4, Sardar Sarovar Dam, Kevadia, Gujarat',
          amenities: 'Royal Tents with AC, Multi-Cuisine Dining Hall, Golf Carts, Cultural Amphitheatre, Dam View',
          description: 'Premium luxury glamping resort set along the scenic Narmada riverside with front-row access to the Statue of Unity.',
          image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
          contactPhone: '+91 79 2692 9000',
          featured: true
        },
        {
          destinationId: gujarat.id,
          name: 'The Gateway Hotel Gir Forest',
          regionName: 'Gir, Gujarat',
          category: 'Wildlife Safari Lodge',
          rating: 4.8,
          pricePerNight: 11000,
          address: 'Near Sasan Gir Safari Park, Junagadh District, Gujarat',
          amenities: 'Hiran River Overlook, Jungle Safari Desk, Swimming Pool, Organic Farm Dining',
          description: 'Nestled on the edge of Gir Forest where Asiatic lions roam freely, offering guided naturalists.',
          image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80',
          contactPhone: '+91 2877 285 551',
          featured: true
        },

        // Kashmir Hotels
        {
          destinationId: kashmir.id,
          name: 'The Khyber Himalayan Resort & Spa (Gulmarg)',
          regionName: 'Gulmarg, Jammu & Kashmir',
          category: 'Luxury Alpine Resort',
          rating: 5.0,
          pricePerNight: 32000,
          address: 'Gulmarg, Baramulla District, Jammu & Kashmir',
          amenities: 'Heated Indoor Swimming Pool, L\'Occitane Himalayan Spa, Ski-in/Ski-out, Nouf Deck, Pine Views',
          description: 'India’s premier alpine luxury resort located at 8,825 feet amidst pristine pine forests with panoramic views of snow-capped Affarwat peaks.',
          image: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=800&q=80',
          contactPhone: '+91 1954 254 666',
          featured: true
        },
        {
          destinationId: kashmir.id,
          name: 'Vivanta Dal View by Taj (Srinagar)',
          regionName: 'Srinagar, Jammu & Kashmir',
          category: '5-Star Mountain Resort',
          rating: 4.9,
          pricePerNight: 24000,
          address: 'Kralsangri, Gopkar Road, Srinagar, Jammu & Kashmir',
          amenities: 'Infinity View Terrace over Dal Lake, Jiva Spa, Wazwan Specialty Kitchen, Apple Orchard Strolls',
          description: 'Perched on Kralsangri hill overlooking the turquoise waters of Dal Lake, surrounded by Zabarwan mountains.',
          image: 'https://images.unsplash.com/photo-1566837945700-30057527ade0?auto=format&fit=crop&w=800&q=80',
          contactPhone: '+91 194 246 1111',
          featured: true
        }
      ]);

      // 4. Seed Tourism Guides Profiles
      await db.insert(guides).values([
        // Kolkata Guides
        {
          destinationId: kolkata.id,
          name: 'Sourav Banerjee',
          regionName: 'Kolkata, West Bengal',
          experienceYears: 12,
          languages: 'English, Bengali, Hindi, French',
          rating: 4.9,
          reviewCount: 164,
          pricePerDay: 2200,
          specialty: 'Colonial Architecture, Hooghly Ferry Trails & British Bengal History',
          bio: 'Historian and certified Master Guide leading immersive architectural walks across North Kolkata rajbaris, Victoria Memorial archives, and heritage tramway trails.',
          photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          contactPhone: '+91 98301 22334',
          certifiedBy: 'Ministry of Tourism, Govt of India',
          badge: 'Master Heritage Guide'
        },
        {
          destinationId: kolkata.id,
          name: 'Ananya Roy',
          regionName: 'Kolkata, West Bengal',
          experienceYears: 8,
          languages: 'English, Bengali, Hindi',
          rating: 4.8,
          reviewCount: 98,
          pricePerDay: 1800,
          specialty: 'Culinary Food Walks, Kumartuli Idol Sculptors & College Street Book Bazaar',
          bio: 'Born and raised in North Kolkata, passionate about taking travelers into the artisanal clay studios of Kumartuli and legendary 100-year-old sweetmakers of Bengal.',
          photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
          contactPhone: '+91 98305 66778',
          certifiedBy: 'West Bengal Tourism Development Corp',
          badge: 'Senior Cultural Specialist'
        },

        // Delhi Guides
        {
          destinationId: delhi.id,
          name: 'Vikramaditya Sharma',
          regionName: 'New Delhi',
          experienceYears: 15,
          languages: 'English, Hindi, German, Urdu',
          rating: 5.0,
          reviewCount: 240,
          pricePerDay: 2800,
          specialty: 'Mughal History, Archaeological Monuments & Old Delhi Spice Trails',
          bio: 'Archaeologist by education and national tourism awardee. Specializes in decoding Persian calligraphy at Qutub Minar, Humayun’s Tomb, and secret history of the Red Fort.',
          photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
          contactPhone: '+91 98110 55443',
          certifiedBy: 'Ministry of Tourism, Govt of India',
          badge: 'National Awardee Historian'
        },
        {
          destinationId: delhi.id,
          name: 'Zoya Farooqui',
          regionName: 'New Delhi',
          experienceYears: 10,
          languages: 'English, Hindi, Spanish, Urdu',
          rating: 4.9,
          reviewCount: 135,
          pricePerDay: 2400,
          specialty: 'Sufi Shrines, Nizamuddin Basti & Chandni Chowk Food Walks',
          bio: 'Curates soul-stirring evening Sufi Qawwali journeys at Hazrat Nizamuddin Dargah and sensory spice tours through Khari Baoli market.',
          photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
          contactPhone: '+91 98118 77665',
          certifiedBy: 'Delhi Tourism & Transportation Dev Corp',
          badge: 'Heritage & Food Curator'
        },

        // Rajasthan Guides
        {
          destinationId: rajasthan.id,
          name: 'Thakur Ranveer Singh Rathore',
          regionName: 'Jaipur, Rajasthan',
          experienceYears: 18,
          languages: 'English, Hindi, Rajasthani, Italian',
          rating: 5.0,
          reviewCount: 310,
          pricePerDay: 3500,
          specialty: 'Rajput Fort Architecture, Royal Armory & Thar Desert Astronomy',
          bio: 'Direct descendant of Rajput royal courtiers with unparalleled knowledge of Mewar and Marwar hill forts, underground escape routes of Jaigarh, and desert astronomy.',
          photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
          contactPhone: '+91 94140 12345',
          certifiedBy: 'Ministry of Tourism, Govt of India',
          badge: 'Royal Rajput Historian'
        },
        {
          destinationId: rajasthan.id,
          name: 'Priyanka Shekhawat',
          regionName: 'Udaipur, Rajasthan',
          experienceYears: 11,
          languages: 'English, Hindi, French',
          rating: 4.9,
          reviewCount: 175,
          pricePerDay: 2600,
          specialty: 'Udaipur Lake Palaces, Miniature Paintings & Textile Block Printing',
          bio: 'Expert in the living arts of Rajasthan, specializing in private studio tours with master miniature painters and sunset boat history on Lake Pichola.',
          photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
          contactPhone: '+91 94144 67890',
          certifiedBy: 'Rajasthan Tourism Development Corp',
          badge: 'Art & Heritage Specialist'
        },

        // Gujarat Guides
        {
          destinationId: gujarat.id,
          name: 'Dharmesh Patel',
          regionName: 'Ahmedabad, Gujarat',
          experienceYears: 14,
          languages: 'English, Gujarati, Hindi',
          rating: 4.8,
          reviewCount: 140,
          pricePerDay: 2500,
          specialty: 'UNESCO Heritage Walled City, Ancient Stepwells & Rann of Kutch Safaris',
          bio: 'Pioneer of the famous Old Ahmedabad Pols morning heritage walk and certified guide for the UNESCO World Heritage stepwells of Adalaj and Rani ki Vav.',
          photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
          contactPhone: '+91 98250 88990',
          certifiedBy: 'Gujarat Tourism Govt of Gujarat',
          badge: 'UNESCO Heritage Guide'
        },
        {
          destinationId: gujarat.id,
          name: 'Rupal Jadeja',
          regionName: 'Gir & Kutch, Gujarat',
          experienceYears: 9,
          languages: 'English, Gujarati, Hindi',
          rating: 4.9,
          reviewCount: 112,
          pricePerDay: 2200,
          specialty: 'Asiatic Lion Tracking in Gir, Statue of Unity & Kutchi Handlooms',
          bio: 'Certified wildlife naturalist with over 500 successful Asiatic lion sightings in Sasan Gir and specialist in Rabari tribal embroidery.',
          photo: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=400&q=80',
          contactPhone: '+91 98254 33221',
          certifiedBy: 'Gir Wildlife Sanctuary & Gujarat Tourism',
          badge: 'Senior Wildlife Naturalist'
        },

        // Kashmir Guides
        {
          destinationId: kashmir.id,
          name: 'Mir Ghulam Hassan',
          regionName: 'Srinagar, Jammu & Kashmir',
          experienceYears: 22,
          languages: 'English, Kashmiri, Hindi, Urdu',
          rating: 5.0,
          reviewCount: 380,
          pricePerDay: 3000,
          specialty: 'Dal Lake Shikara Heritage, Mughal Gardens & Pashmina Artisans',
          bio: 'Born in a Dal Lake houseboat family, Ghulam has guided international diplomats and documentary filmmakers through the secret channels and floating markets of Kashmir.',
          photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
          contactPhone: '+91 194 245 8899',
          certifiedBy: 'J&K Tourism Department',
          badge: 'Master Lake Historian'
        },
        {
          destinationId: kashmir.id,
          name: 'Tariq Ahmad Lone',
          regionName: 'Gulmarg, Jammu & Kashmir',
          experienceYears: 12,
          languages: 'English, Kashmiri, Hindi',
          rating: 4.9,
          reviewCount: 195,
          pricePerDay: 2800,
          specialty: 'Gulmarg Ski Instruction, Apharwat Alpine Treks & Betaab Valley Trails',
          bio: 'Certified Ski Instructor and Himalayan Mountain Guide specializing in safe alpine exploration, powder snow skiing, and Lidder river trout angling in Pahalgam.',
          photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
          contactPhone: '+91 1954 220 112',
          certifiedBy: 'Indian Institute of Skiing & Mountaineering',
          badge: 'Alpine Mountaineering Specialist'
        }
      ]);

      // 5. Seed Iconic Restaurants & Fooding Guide
      await db.insert(restaurants).values([
        // Kolkata Restaurants
        {
          destinationId: kolkata.id,
          regionName: 'Kolkata, West Bengal',
          name: 'Peter Cat',
          cuisineType: 'Colonial Continental & Indian Sizzlers',
          priceForTwo: 1500,
          rating: 4.9,
          address: '18A Park Street, Park Street Area, Kolkata',
          mustTryDishes: 'Iconic Chelo Kebab with Butter & Egg, Chicken Steak Sizzler, Irish Coffee',
          description: 'A legendary dining institution on Park Street since 1975, celebrated for its vintage dimly-lit colonial ambiance and India\'s most famous Chelo Kebab.',
          timing: '11:00 AM – 11:30 PM',
          famousFor: 'Original Iranian Chelo Kebab & Nostalgic Park Street Jazz Charm',
          image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80'
        },
        {
          destinationId: kolkata.id,
          regionName: 'Kolkata, West Bengal',
          name: 'Arsalan',
          cuisineType: 'Authentic Kolkata Mughlai & Biryani',
          priceForTwo: 1100,
          rating: 4.8,
          address: '138 Bidhan Sarani / Marina Arcade, Park Circus, Kolkata',
          mustTryDishes: 'Special Kolkata Mutton Biryani (with Aloo & Egg), Mutton Chaap, Phirni',
          description: 'The undisputed king of Kolkata fragrant Awadhi-style Biryani, cooked with long-grain basmati rice, tender meat, and the signature melt-in-mouth potato.',
          timing: '11:00 AM – Midnight',
          famousFor: 'Legendary Kolkata Mutton Biryani & Awadhi Chaap',
          image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80'
        },
        {
          destinationId: kolkata.id,
          regionName: 'Kolkata, West Bengal',
          name: '6 Ballygunge Place',
          cuisineType: 'Aristocratic Bengali Heritage Fine Dining',
          priceForTwo: 1600,
          rating: 4.8,
          address: '6 Ballygunge Place, Ballygunge, Kolkata',
          mustTryDishes: 'Daab Chingri (Prawns inside tender coconut), Kosha Mangsho with Luchi, Bhapa Ilish',
          description: 'Housed in a 100-year-old restored Bengali zamindar mansion, serving recipes inspired by the royal kitchens of Rabindranath Tagore’s ancestral household.',
          timing: '12:00 PM – 3:30 PM, 7:00 PM – 10:30 PM',
          famousFor: 'Daab Chingri in coconut shell & Royal Zamindari Thali',
          image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80'
        },

        // Delhi Restaurants
        {
          destinationId: delhi.id,
          regionName: 'New Delhi',
          name: 'Bukhara @ ITC Maurya',
          cuisineType: 'North-West Frontier & Royal Tandoor',
          priceForTwo: 6500,
          rating: 5.0,
          address: 'ITC Maurya, Diplomatic Enclave, Chanakyapuri, New Delhi',
          mustTryDishes: 'Dal Bukhara (Slow-cooked 18 hours), Sikandari Raan, Tandoori Jhinga, Naan Bukhara',
          description: 'Consistently ranked among the top 50 restaurants in Asia, famous for its rustic clay oven tandoors, wooden aprons, and world leaders dining with hands.',
          timing: '12:30 PM – 2:45 PM, 7:00 PM – 11:45 PM',
          famousFor: 'World\'s #1 Dal Bukhara and Sikandari Raan',
          image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80'
        },
        {
          destinationId: delhi.id,
          regionName: 'New Delhi',
          name: 'Karim\'s (Jama Masjid)',
          cuisineType: 'Historic Royal Mughal Cuisine',
          priceForTwo: 1200,
          rating: 4.8,
          address: '16 Gali Kababian, Jama Masjid, Old Delhi',
          mustTryDishes: 'Mutton Nihari at dawn, Mutton Burra Kebab, Chicken Jahangiri, Sheermal Roti',
          description: 'Established in 1913 by royal chef Haji Karimuddin from the Mughal Emperor’s kitchen, serving timeless royal recipes outside the gates of Jama Masjid.',
          timing: '7:00 AM – 11:30 PM',
          famousFor: 'Historic Mughal royal recipes since the reign of Bahadur Shah Zafar',
          image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80'
        },

        // Rajasthan Restaurants
        {
          destinationId: rajasthan.id,
          regionName: 'Jaipur, Rajasthan',
          name: '1135 AD (Amber Fort)',
          cuisineType: 'Royal Rajput Palatial Dining',
          priceForTwo: 3800,
          rating: 4.9,
          address: 'Level 2, Jaleb Chowk, Amber Fort, Amer, Jaipur',
          mustTryDishes: 'Royal Laal Maas (Smoked red mutton curry), Safed Maas, Mewari Dal Baati, Shahi Tukda',
          description: 'Dine like Rajput royalty inside the illuminated ramparts of Amber Fort, with gold-leaf ceilings, antique silver thalis, and live classical sitar music.',
          timing: '11:00 AM – 10:30 PM',
          famousFor: 'Dining inside a 400-year-old royal fortress chamber with silver cutlery',
          image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80'
        },
        {
          destinationId: rajasthan.id,
          regionName: 'Jaipur, Rajasthan',
          name: 'Chokhi Dhani Ethnic Village',
          cuisineType: 'Authentic Unlimited Rajasthani Royal Thali',
          priceForTwo: 1600,
          rating: 4.8,
          address: '12 Miles, Tonk Road, Jaipur, Rajasthan',
          mustTryDishes: 'Unlimited Dal Baati Churma with Pure Ghee, Ker Sangri, Gatte ki Sabzi, Bajra Roti with Jaggery',
          description: 'A vibrant Rajasthani cultural village with folk dances, camel rides, fire performers, and authentic seated banquet on traditional chowkis.',
          timing: '5:00 PM – 11:00 PM',
          famousFor: 'Pure Desi Ghee Dal Baati Churma & Kalbelia Folk Evenings',
          image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80'
        },

        // Gujarat Restaurants
        {
          destinationId: gujarat.id,
          regionName: 'Ahmedabad, Gujarat',
          name: 'Agashiye @ The House of MG',
          cuisineType: 'Grand Royal Gujarati Thali on Terrace',
          priceForTwo: 1800,
          rating: 4.9,
          address: 'The House of MG, Opp. Sidi Saiyyed Mosque, Old City, Ahmedabad',
          mustTryDishes: 'Seasonal Undhiyu, Rasawala Khaman, Kesar Shrikhand, Puran Poli, Jalebi with Rabdi',
          description: 'Spread over two open-air heritage terraces, serving traditional Gujarati hospitality on bronze kansa thalis with hand-ground spices and fresh seasonal vegetables.',
          timing: '12:00 PM – 3:30 PM, 7:00 PM – 11:00 PM',
          famousFor: 'World\'s finest terrace Gujarati Thali in UNESCO heritage mansion',
          image: 'https://images.unsplash.com/photo-1613946069412-38f7f1ff0b65?auto=format&fit=crop&w=800&q=80'
        },
        {
          destinationId: gujarat.id,
          regionName: 'Ahmedabad, Gujarat',
          name: 'Vishalla Ethnic Village',
          cuisineType: 'Authentic Kathiyawadi & Village Dining',
          priceForTwo: 1400,
          rating: 4.7,
          address: 'Vasna Toll Naka, Ahmedabad, Gujarat',
          mustTryDishes: 'Ringna No Oro (Smoked Eggplant), Bajra Rotla with Homemade White Butter & Jaggery, Khichdi Kadhi',
          description: 'An open-air mud-hut village sanctuary lit by lanterns, where food is served on sal-leaf plates while seated on floor mats with utensil museum tours.',
          timing: '3:00 PM – 11:00 PM',
          famousFor: 'Rural Kathiyawadi cuisine on leaf plates under lantern light',
          image: 'https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&w=800&q=80'
        },

        // Kashmir Restaurants
        {
          destinationId: kashmir.id,
          regionName: 'Srinagar, Jammu & Kashmir',
          name: 'Ahdoos Restaurant (Jhelum Bank)',
          cuisineType: 'Authentic 36-Course Kashmiri Wazwan',
          priceForTwo: 1800,
          rating: 4.9,
          address: 'Residency Road, Regal Chowk, Srinagar, Kashmir',
          mustTryDishes: 'Traditional Wazwan (Rogan Josh, Rista in saffron gravy, Gushtaba in yogurt, Tabak Maaz)',
          description: 'Dating back to 1918 on the bank of the Jhelum River, Ahdoos is the benchmark of authentic Kashmiri Wazwan cooked by master Wazas.',
          timing: '12:00 PM – 10:30 PM',
          famousFor: 'Original 100-year-old authentic Kashmiri Wazwan banquet',
          image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80'
        },
        {
          destinationId: kashmir.id,
          regionName: 'Srinagar, Jammu & Kashmir',
          name: 'Chai Jaai Tea Room',
          cuisineType: 'Kashmiri Samovar Tea House & Artisan Bakery',
          priceForTwo: 600,
          rating: 4.8,
          address: 'Mahatta & Co, The Bund, Residency Road, Srinagar',
          mustTryDishes: 'Pink Noon Chai with fresh cream, Saffron Kehwa with crushed almonds, Kashmiri Lavasa & Bakerkhani',
          description: 'A delightful vintage tea salon inspired by Kashmiri craft and English Cotswolds tea culture, serving tea from hand-beaten brass Samovars.',
          timing: '10:00 AM – 8:30 PM',
          famousFor: 'Traditional brass Samovar Kehwa and pink salted Noon Chai',
          image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80'
        }
      ]);

      // 6. Seed Travel Packages
      await db.insert(packages).values([
        {
          name: 'Royal Rajasthan Heritage Odyssey',
          region: 'Rajasthan',
          description: 'Experience true royalty across Jaipur, Jodhpur & Udaipur with stays in heritage Havelis, sunset boat cruises on Lake Pichola, and guided tours of majestic hill forts.',
          duration: '7 Days / 6 Nights',
          price: 34999,
          placesCovered: 'Jaipur, Amer Fort, Jodhpur, Mehrangarh, Udaipur, Lake Pichola',
          highlights: 'Private guided fort visits, Lake Pichola sunset cruise, folk dance & dinner, luxury AC transfers',
          inclusions: '4-Star/Heritage Hotels, Daily Breakfast & Dinner, AC Innova Transfers, Monument Entry Passes',
          image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80'
        },
        {
          name: 'Kashmir Paradise & Snow Glades',
          region: 'Jammu & Kashmir',
          description: 'The ultimate Himalayan escape. Includes luxury houseboat stay on Dal Lake, Gulmarg Gondola rides to Apharwat snow peaks, and Lidder river picnics in Pahalgam.',
          duration: '6 Days / 5 Nights',
          price: 29499,
          placesCovered: 'Srinagar, Dal Lake, Gulmarg, Apharwat Peak, Pahalgam, Betaab Valley',
          highlights: 'Shikara sunset ride, Gondola Phase 1 & 2 tickets included, Wazwan authentic feast, Saffron farm visit',
          inclusions: 'Deluxe Houseboat & Resort Stays, All Meals (Breakfast + Dinner), Private Cab, Shikara Rides',
          image: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=800&q=80'
        },
        {
          name: 'Kolkata Cultural & Bengal Heritage Trail',
          region: 'Kolkata & West Bengal',
          description: 'Immerse yourself in India’s intellectual capital. Visit Victoria Memorial, Howrah Bridge, historic tramways, Dakshineswar temple, and authentic sweetmakers of Bengal.',
          duration: '5 Days / 4 Nights',
          price: 18999,
          placesCovered: 'Victoria Memorial, Howrah Bridge, Belur Math, Park Street, Kumartuli, Princep Ghat',
          highlights: 'Heritage Tramway experience, Hooghly river sunset cruise, Guided food walk through Old Kolkata',
          inclusions: 'Heritage 4-Star Hotel, Breakfast & Kolkata Food Walks, AC Vehicle, Local Bengali Expert Guide',
          image: 'https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=800&q=80'
        },
        {
          name: 'Vibrant Gujarat: White Rann, Lions & Heritage',
          region: 'Gujarat',
          description: 'Explore the spectacular Rann of Kutch during Rann Utsav, spot Asiatic lions in Gir National Park, and visit the colossal Statue of Unity.',
          duration: '6 Days / 5 Nights',
          price: 26500,
          placesCovered: 'Rann of Kutch, Bhuj, Gir National Park, Statue of Unity, Ahmedabad',
          highlights: 'Full Moon Rann Utsav glamping, Open Gypsy Lion Safari in Gir, VIP viewing at Statue of Unity',
          inclusions: 'Luxury Tent & Wildlife Lodge stays, All meals at Rann, Safari Permits, Private Transport',
          image: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=800&q=80'
        },
        {
          name: 'Imperial Delhi & Golden Triangle Circuit',
          region: 'New Delhi & NCR',
          description: 'Discover the glorious history of New Delhi’s monuments combined with the timeless romance of the Taj Mahal in Agra and royal Jaipur.',
          duration: '5 Days / 4 Nights',
          price: 21000,
          placesCovered: 'Qutub Minar, India Gate, Red Fort, Humayun Tomb, Agra Taj Mahal, Jaipur Amer Fort',
          highlights: 'Sunrise at Taj Mahal, Chandni Chowk street food rickshaw tour, Qutub Minar heritage exploration',
          inclusions: '5-Star City Hotels, Daily Breakfast, Private Chauffeur AC Sedan, Fast-Track Monument Tickets',
          image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80'
        }
      ]);

      res.json({ success: true, message: 'Successfully seeded comprehensive Indian Destinations, Regional Hotels, Certified Tourism Guides, Famous Restaurants, and Travel Packages!' });
    } catch (error) {
      console.error('Seed error:', error);
      res.status(500).json({ error: 'Failed to seed database', details: error instanceof Error ? error.message : String(error) });
    }
  });

  // Frontend handler
  app.get('*', async (req, res, next) => {
    try {
      const url = req.originalUrl;
      let template;
      if (!isProd) {
        template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
      } else {
        template = fs.readFileSync(path.resolve(__dirname, 'dist/index.html'), 'utf-8');
      }
      res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
    } catch (e) {
      !isProd && vite.ssrFixStacktrace(e);
      next(e);
    }
  });

  app.listen(port, () => console.log(`Incredible India Tourism Server running on port ${port}`));
}

bootstrap().catch(console.error);
