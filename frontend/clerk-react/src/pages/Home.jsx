import React from "react";
import "./Home.css";
import bannerImage from "../assets/images/banner-img.webp";
import part1 from "../assets/images/Anti Brake Module-Pump.webp";
import part2 from "../assets/images/Radio controller- Display.webp";
import part3 from "../assets/images/Display.webp";
import part4 from "../assets/images/Mechanical Parts.webp";
import part5 from "../assets/images/Body Parts.webp";
import part6 from "../assets/images/transmission.webp";
import part7 from "../assets/images/Engine Computers.webp";
import part8 from "../assets/images/Engine.webp";
import part9 from "../assets/images/Engines.webp";
import part10 from "../assets/images/Rims.webp";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Manufacturer-Model mapping
const vehicleData = {
  
  "Buick": ["Allure", "Century", "Electra", "Enclave", "Lacrosse", "Lesabre", "Lucerne", "Park Avenue", "Rainier", "Reatta", "Regal", "Riviera", "Roadmaster", "Skyhawk", "Skylark", "Somerset", "Terraza", "Rendezvous", "ENCORE"],
  "Cadillac": ["XTS", "Allante", "Brougham", "Catera", "Cimarron", "CTS", "Deville", "DTS", "Eldorado", "Escalade", "Escalade ESV", "Escalade EXT", "Fleetwood", "Seville", "SRX", "STS", "XLR", "ATS", "ELR"],
  "Chevy": ["Spark", "Caprice SS", "TRAX", "Volt", "2500 Pickup", "30 Pickup", "3100 Pickup", "3500 Pickup", "3600 Pickup", "3800 Pickup", "Astro", "Avalanche 1500", "Avalanche 2500", "Aveo", "Beretta", "Camaro", "Caprice", "Cavalier", "Celebrity", "Chevelle", "Chevette", "10", "1500", "20", "Citation", "Cobalt", "Colorado", "Corsica", "Corvette", "Cruze", "Equinox", "EV1", "Express 1500 Van", "Express 2500 Van", "Express 3500 Van", "Forward Control", "HHR", "II", "Impala", "Lumina", "Lumina Van", "Luv", "Malibu", "Metro", "Monte Carlo", "Monza", "Nova", "Omega", "Optra", "Passenger", "Prizm", "Silverado 1500", "Silverado 2500", "Silverado 3500", "Spectrum", "Sprint", "SSR", "Suburban 10", "Suburban 1000", "Suburban 1500", "Suburban 20", "Suburban 2500", "Suburban 30", "Tahoe", "Tracker", "Trailblazer", "Trailblazer EXT", "Traverse", "Uplander"],
  "Chrysler": ["300", "300M", "Arrow Truck", "Concorde", "Conquest", "Crossfire", "Dart", "Lebaron", "LHS", "New Yorker (RWD)", "Newport", "Pacifica", "PT Cruiser", "Raider", "Sebring", "Town and Country"],
  "Dodge": ["100", "150", "1500", "200", "250", "2500", "300 Pickup", "350", "3500", "400", "450", "600", "Aries", "Avenger", "Caliber", "Caravan", "Challenger", "Charger", "Colt", "D50", "Dakota", "Daytona", "Diplomat", "Durango", "Dynasty", "Forward Control", "Imperial", "Intrepid", "Journey", "Lancer", "Laser", "Magnum", "Mirada", "Monaco", "Nitro", "Omni", "Passenger", "Ram", "Rampage", "Shadow", "Spirit", "Sprinter", "Stealth", "Stratus", "Valiant", "Voyage"],
  "Eagle": ["100 Van", "150 Van", "1500 Van", "200", "200 Van", "2000 GTX", "250 Van", "2500 Van", "300 Van", "350 Van", "3500 Van", "Compass", "Premier", "Promaster 1500 Van", "Promaster 2500 Van", "Promaster 3500 Van", "Promaster City", "Sprinter 3500", "Vipe", "Summit", "Talon"],
  "Ford": ["Aerostar", "Aspire", "Bronco", "CMAX", "Contour", "Crown Victoria", "E100 Van", "E150 Van", "E200 Van", "E250 Van", "E300 Van", "E350 Van", "Edge", "Escape", "Escort", "Excursion", "Exp", "Expedition", "Explorer", "F100", "F150", "F150 Raptor", "F250", "F250SD", "F350", "F350SD", "F450", "F450SD", "F550SD", "Fairlane", "Fairmont", "Falcon", "Festiva", "Fiesta", "Five Hundred", "Flex", "Focus", "GT", "Forward Control", "Freestar", "Freestyle", "Fusion", "Granada", "LTD", "Maverick", "Mustang", "Probe", "Ranger", "Taurus", "Tempo", "Thunderbird", "Torino", "TRANSIT 150", "TRANSIT 250", "TRANSIT 350", "Transit Connect"],
  "GMC": ["Jimmy S15", "Safari", "Sierra 1500", "Sierra 2500", "Sierra 3500", "Sierra Denali 1500", "Sierra Denali 2500", "Sierra Denali 3500", "Sonoma", "Syclone", "Terrain", "Typhoon", "Yukon XL 1500", "Yukon XL 2500", "1000", "1000 Van", "1500 Van", "20 Van", "2000", "2500 Van", "30 Van", "3500 Pickup", "3500 Van", "6000", "Acadia", "Canyon", "Denali", "Envoy", "Envoy XL", "Envoy XUV", "1000 Pickup", "1500 Pickup"],
  "Honda": ["Accord", "Civic", "CRV", "Crosstour", "CRX", "Del Sol", "Element", "FIT", "Insight", "Odyssey", "Passport", "Pilot", "Prelude", "Ridgeline", "S2000"],
  "Hyundai": ["Accent", "Azera", "Elantra", "Entourage", "EQUUS", "Excel", "Genesis", "Pony", "Santa Fe", "Scoupe", "Sonata", "Stellar", "Tiburon", "Tucson", "VELOSTER", "Veracruz", "XG"],
  "Infiniti": ["EX35", "EX37", "FX", "G20", "G25", "G35", "G37", "I30", "I35", "J30", "JX35", "M30", "M35", "M37", "M45", "M56", "Q40", "Q45", "Q50", "Q60", "Q70", "QX4", "QX50", "QX56", "QX60", "QX70", "QX80"],
  "Isuzu": ["Amigo", "Ascender", "Axiom", "Hombre", "I280", "I290", "I350", "I370", "Imark", "Impulse", "Oasis", "Optima", "Pickup", "Rodeo", "Stylus", "Trooper"],
  "Jaguar": ["F TYPE", "S Type", "X Type", "XF", "XJ", "XJ12", "XJ6", "XJ8", "XJS", "XK", "XK8", "XKE"],
  "Jeep": ["Cherokee", "CJ Series", "Comanche", "Commander", "DJ", "FC", "Grand Cherokee", "Grand Wagoneer", "Liberty", "Patriot", "Station Wagon", "Truck", "Wrangler"],
  "Kia": ["Amanti", "Borrego", "CADENZA", "Forte", "K900", "Magentis", "Optima", "Rio", "Rondo", "Sedona", "Sephia", "Sorento", "Soul", "Spectra", "Sportage"],
  "Landrover": ["DISCOVERY SPORT", "EVOQUE", "Freelander", "LR2", "LR3", "LR4", "Range Rover", "Range Rover Sport", "STERLING"],
  "Lexus": ["ES250", "ES300", "ES330", "ES350", "GS300", "GS350", "GS400", "GS430", "GS460", "GX460", "GX470", "IS F", "IS250", "IS300", "IS350", "LS400", "LS430", "LS460", "LX450", "LX470", "LX570", "RC 350", "RX300", "RX330", "RX350", "RX400H", "RX450H", "SC", "SC430"],
  "Lincoln": ["MKS", "MKT", "MKX", "MKZ", "Aviator", "Blackwood", "Continental", "LS", "LT", "Mark Series", "Navigator", "Town Car", "Zephyr"],
  "Mazda": ["323", "5", "6", "626", "808", "929", "B1600", "B1800", "B2000", "B2200", "B2300", "B2500", "B2600", "B3000", "B4000", "CX5", "CX7", "CX9", "Millenia", "MPV", "MX3", "MX5", "MX6", "Navajo", "Protege", "RX7", "RX8", "Tribute", "3"],
  "Mercedes": ["190", "220", "230/4", "240D", "250", "260E", "280", "300D", "300E", "380", "400", "420", "560", "600", "B Class", "C Class", "CL Class", "CLA Class", "CLK", "CLS Class", "E Class", "G Class", "GL Class", "GLA Class", "GLK Class", "ML Class", "R Class", "S Class", "SLK", "SLR", "SLS", "Smart", "Sprinter 2500", "Sprinter 3500"],
  "Mercury": ["Bobcat", "Capri", "Cougar", "Grand Marquis", "Marauder", "Mariner", "Marquis", "Merkur", "Milan", "Monarch", "Montego", "Monterey", "Mountaineer", "Mystique", "Sable", "Topaz", "Tracer", "Villager"],
  "Mini": ["Cooper Clubman", "Cooper Countryman", "Cooper Mini"],
  "Mitsubishi": ["3000GT", "Cordia", "Diamante", "Eclipse", "Endeavor", "Expo", "Galant", "Lancer", "Mirage", "Montero", "Montero Sport", "Outlander", "Pickup", "Raider", "Sigma", "Starion", "Van"],
  "Nissan": ["200SX", "240SX", "280Z", "280ZX", "300ZX", "350Z", "370Z", "Altima", "Armada", "B210", "Cube", "Frontier", "GTR", "Juke", "LEAF", "Maxima", "Murano", "NV 1500", "NV 2500", "NV 3500", "NV 200", "NX", "Pathfinder", "Pickup", "Pulsar", "Quest", "Rogue", "Sentra", "Stanza", "Stanza Van", "Titan", "Versa", "X Trail", "Xterra"],
  "Oldsmobile": ["Achieva", "Alero", "Aurora", "Bravada", "Calais", "Ciera", "Custom Cruiser", "Cutlass", "Eighty Eight", "Firenza", "Intrigue", "Ninety Eight", "Silhouette", "Toronado"],
  "Plymouth": ["Caravelle", "Champ", "Gran Fury", "Passenger", "Sapporo", "Scamp", "Tail Duster", "Vista", "Volar", "Acclaim", "Barracuda", "Breeze", "Prowler", "Reliant", "Sundance"],
  "Pontiac": ["Aztek", "Bonneville", "Catalina", "Fiero", "Firebird", "G3", "G5", "G6", "G8", "Grand Am", "Grand Prix", "GTO", "Le Mans", "Montana", "Parisienne", "Solstice", "Sunbird", "Sunfire", "Tempest", "Trans Sport", "Vibe"],
  "Porsche": ["911", "912", "914", "924", "928", "944", "968", "Boxster", "Carrera", "Cayenne", "Cayman", "Panamera"],
  "Saab": ["9-5", "97X", "900", "9000", "92X", "9-3", "95", "96", "99", "93"],
  "Saturn": ["Aura", "Ion", "Outlook", "L", "S", "Sky", "Vue"],
  "Scion": ["FRS", "IQ", "TC", "XA", "XB", "XD"],
  "Subaru": ["Baja", "BRZ", "Forester", "Impreza", "Legacy", "SVX", "Tribeca", "WRX", "XT", "XV CROSSTREK"],
  "Suzuki": ["Aerio", "Equator", "Esteem", "Forenza", "Forsa", "Samurai", "Sidekick", "SJ410", "Swift", "SX4", "Verona", "Vitara", "X90"],
  "Toyota": ["4Runner", "Avalon", "Camry", "Celica", "Corolla", "Corona", "Cressida", "Echo", "FJ Cruiser", "FX", "Highlander", "Land Cruiser", "Matrix", "MR2", "Paseo", "Pickup", "Previa", "Prius", "Rav4", "Sequoia", "Sienna", "Solara", "Supra", "T100", "Tacoma", "Tercel", "Tundra", "Van Wagon", "Venza", "Yaris"],
  "Volkswagen": ["Beetle", "Cabriolet", "Corrado", "Dasher", "Eos", "Eurovan", "Fox", "Golf", "Jetta", "Karmann Ghia", "Passat", "Phaeton", "Quantum", "Rabbit", "Routan", "Scirocco", "Thing", "Tiguan", "Touareg", "Transporter", "Vanagon"],
  "Volvo": ["240", "260", "444", "544", "740", "760", "780", "850", "940", "960", "S60", "S70", "S80", "S90", "V60", "XC90"]

};

// Parts categories list - all properly capitalized
const partCategories = [
  "Engine",
  "Transmission",
  "Alternator",
  "Axle Assembly",
  "AC Compressor",
  "Fuel Pump",
  "Brake Booster",
  "Steering Column",
  "Wheel Rim",
  "Bumper",
  "Headlight",
  "Taillight",
  "Door",
  "Hood",
  "Fender",
  "Side View Mirror",
  "Dashboard",
  "Seat",
  "Sunroof",
  "Heater Core",
  "Grille",
  "Flywheel",
  "Oil Pan",
  "Transfer Case",
  "Turbocharger",
  "Power Steering Pump",
  "Shock Absorber",
  "Strut",
  "Control Arm",
  "Ball Joint",
  "Brake Caliper",
  "Driveshaft",
  "Air Filter",
  "Exhaust Manifold",
  "Intake Manifold",
  "Window Regulator",
  "Windshield",
  "Fuel Injector",
  "Ignition Coil",
  "Speedometer",
  "Cluster",
  "Wiring Harness",
  "ECU Computer",
  "Door Lock Actuator",
  "Fuel Tank",
  "Steering Rack",
  "Differential",
  "Hub Assembly",
  "Spindle",
  "Knuckle",
  "Suspension Arm",
  "Spring",
  "Trunk Lid",
  "Spoiler",
  "Crossmember",
  "Mount Bracket",
  "Engine Cradle",
  "Control Module",
  "Valve Cover",
  "Oil Pump",
  "Fuel Rail",
  "Airbag",
  "Seat Belt",
  "Sensor",
  "Oxygen Sensor",
  "Mass Air Flow Sensor",
  "ABS Module",
  "Radiator Fan",
  "Blower Motor",
  "HVAC Control",
  "Radio",
  "Infotainment Unit",
  "Antenna",
  "GPS Module",
  "Camera",
  "Rearview Mirror",
  "Door Handle",
  "Tailgate",
  "Cargo Door",
  "Side Step",
  "Roof Rack",
  "Fuel Door",
  "License Plate Bracket",
  "Fog Light",
  "Signal Light",
  "Backup Light",
  "Headlamp Switch",
  "Turn Signal Switch",
  "Wiper Motor",
  "Washer Pump",
  "Coolant Reservoir",
  "Overflow Tank",
  "Brake Line",
  "Clutch Master Cylinder",
  "Slave Cylinder",
  "Shifter",
  "Gearbox",
  "Torque Converter",
  "Bell Housing",
  "Drum",
  "Clutch Disc",
  "Pedal Assembly",
  "Hood Latch",
  "Hinge",
  "Rear Panel",
  "Floor Pan",
  "Radiator Support",
  "Bumper Reinforcement",
  "Fog Lamp Bezel",
  "Trim Molding",
  "Interior Trim",
  "Dash Bezel",
  "Cup Holder",
  "Glove Box",
  "Console",
  "Armrest",
  "Seat Cover",
  "Door Panel",
  "Rear Deck",
  "Tail Panel",
  "Rear Bumper",
  "Front Bumper",
  "Door Mirror",
  "Engine Cover",
  "Valve Body",
  "Oil Cooler",
  "Transmission Cooler",
  "Clutch Cable",
  "Accelerator Pedal",
  "Brake Pedal",
  "Seat Frame Or Track",
  "Rear Axle",
  "Front Axle",
  "Drivetrain",
  "Motor Controller",
  "Drive Unit",
  "Thermostat",
  "Radiator Cap",
  "Fan Shroud",
  "Air Duct",
  "Engine Mount",
  "Transmission Mount",
  "Floor Shift Assembly",
  "Center Console",
  "Rear Defroster",
  "Blower Resistor"
];

const Home = () => {
  // For horizontal scrolling
  const scrollRef = React.useRef(null);
  
  // State for form
  const [selectedYear, setSelectedYear] = React.useState("");
  const [selectedMake, setSelectedMake] = React.useState("");
  const [selectedModel, setSelectedModel] = React.useState("");
  const [selectedPart, setSelectedPart] = React.useState("");

  // Get available models based on selected make
  const availableModels = selectedMake ? vehicleData[selectedMake] || [] : [];

  const scroll = (direction) => {
    const { current } = scrollRef;
    if (direction === "left") {
      current.scrollLeft -= 300;
    } else {
      current.scrollLeft += 300;
    }
  };

  const handleMakeChange = (e) => {
    setSelectedMake(e.target.value);
    setSelectedModel(""); // Reset model when make changes
  };

  const handleSearch = () => {
    console.log({
      year: selectedYear,
      make: selectedMake,
      model: selectedModel,
      part: selectedPart
    });
    // Add your search logic here
  };

  const FAQItem = ({ item }) => {
    const [open, setOpen] = React.useState(false);

    return (
      <div className={`faq-item ${open ? "open" : ""}`}>
        <div className="faq-question" onClick={() => setOpen(!open)}>
          <h4>{item.question}</h4>
          <span className="faq-icon">{open ? "−" : "+"}</span>
        </div>

        <div className="faq-answer">
          <p>{item.answer}</p>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Banner Section */}
      <section
        className="banner"
        style={{ backgroundImage: `url(${bannerImage})` }}
      >
        <div className="banner-overlay"></div>
        <div className="banner-gradient"></div>

        <div className="banner-inner">
          <div className="banner-left">
            <h1>
              Millions of <span className="highlight">OEM Parts.</span> <br />
              Matched to Your Vehicle.
            </h1>
            <p>One smart search. Your perfect fit starts here.</p>
          </div>

          <div className="banner-right">
            <div className="banner-form">
              <div className="row">
                <select 
                  value={selectedYear} 
                  onChange={(e) => setSelectedYear(e.target.value)}
                >
                  <option value="">Year</option>
                  {Array.from({ length: 2025 - 1990 + 1 }, (_, i) => 2025 - i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                
                <select 
                  value={selectedMake} 
                  onChange={handleMakeChange}
                >
                  <option value="">Make</option>
                  {Object.keys(vehicleData).sort().map(make => (
                    <option key={make} value={make}>{make}</option>
                  ))}
                </select>
                
                <select 
                  value={selectedModel} 
                  onChange={(e) => setSelectedModel(e.target.value)}
                  disabled={!selectedMake}
                >
                  <option value="">Model</option>
                  {availableModels.map(model => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
              </div>
              
              <select 
                className="full" 
                value={selectedPart} 
                onChange={(e) => setSelectedPart(e.target.value)}
              >
                <option value="">Select Part Category</option>
                {partCategories.map((part, index) => (
                  <option key={index} value={part}>
                    {part}
                  </option>
                ))}
              </select>
              
              <button type="button" onClick={handleSearch}>Search Now</button>
            </div>
            <p className="vin-link">
              Don't know your vehicle? <a href="#">Enter VIN</a>
            </p>
          </div>
        </div>
      </section>

      {/* Why Nexxa Auto Parts Section */}
      <section className="why-nexxa">
        <div className="why-nexxa-container">
          <h3 className="why-title">Why Nexxa Auto Parts</h3>

          <div className="why-boxes">
            <div className="why-box">
              <img src={part1} alt="Support" />
              <span>Free expert support</span>
            </div>

            <div className="why-box">
              <img src={part2} alt="Mileage" />
              <span>Low mileage parts</span>
            </div>

            <div className="why-box">
              <img src={part3} alt="Shipping" />
              <span>Nationwide shipping</span>
            </div>

            <div className="why-box">
              <img src={part4} alt="VIN" />
              <span>VIN-matched parts</span>
            </div>
          </div>
        </div>
      </section>

      {/* Explore Our Premium Used Auto Parts */}
      <section className="explore-parts">
        <h2>
          Explore Our <span className="highlight">Premium</span> Used Auto Parts
        </h2>

        <div className="scroll-wrapper">
          <div className="cards-container" ref={scrollRef}>
            {[
              { img: part1, name: "Anti Brake Module-pump" },
              { img: part2, name: "Radio controller- Display" },
              { img: part3, name: "Display" },
              { img: part4, name: "Mechanical" },
              { img: part5, name: "Body Parts" },
              { img: part6, name: "Transmission" },
              { img: part7, name: "Engine computers" },
              { img: part8, name: "Engine" },
              { img: part9, name: "Engines" },
              { img: part10, name: "Rims" },
            ].map((item, idx) => (
              <div className="part-card" key={idx}>
                <img src={item.img} alt={item.name} />
                <p>{item.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <h2>How It Works</h2>

        <div className="features-container">
          <div className="feature-card">
            <div className="feature-header">
              <span className="icon">🔍</span>
              <h3>Find Your Part</h3>
            </div>
            <p>
              Search our extensive inventory by entering your vehicle details
              and part requirements.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-header">
              <span className="icon">💬</span>
              <h3>Get a Quote</h3>
            </div>
            <p>
              Search our extensive inventory by entering your vehicle details
              and part requirements.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-header">
              <span className="icon">🚚</span>
              <h3>Fast Shipping</h3>
            </div>
            <p>
              Search our extensive inventory by entering your vehicle details
              and part requirements.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-header">
              <span className="icon">🛡️</span>
              <h3>Warranty Support</h3>
            </div>
            <p>
              Search our extensive inventory by entering your vehicle details
              and part requirements.
            </p>
          </div>
        </div>
      </section>

      {/* What Our Customers Says */}
      <section className="customer-reviews">
        <h2>
          What Our <span>Customers Says</span>
        </h2>

        <div className="reviews-slider">
          <div className="reviews-track">
            {[
              {
                name: "Rahul Menon",
                review: "Quality parts and fast delivery. Highly recommended!",
              },
              {
                name: "Anjali Krishnan",
                review: "Customer support was very helpful and polite.",
              },
              {
                name: "Arjun Nair",
                review: "Perfect fit for my car. Saved a lot of money.",
              },
              {
                name: "Sreejith Kumar",
                review: "Smooth experience from search to delivery.",
              },
              {
                name: "Neha Sharma",
                review: "Packaging was excellent and product was genuine.",
              },
            ].concat(
              [
                {
                  name: "Rahul Menon",
                  review:
                    "Quality parts and fast delivery. Highly recommended!",
                },
                {
                  name: "Anjali Krishnan",
                  review: "Customer support was very helpful and polite.",
                },
                {
                  name: "Arjun Nair",
                  review: "Perfect fit for my car. Saved a lot of money.",
                },
                {
                  name: "Sreejith Kumar",
                  review: "Smooth experience from search to delivery.",
                },
                {
                  name: "Neha Sharma",
                  review: "Packaging was excellent and product was genuine.",
                },
              ],
            ).map((item, index) => (
              <div className="review-card" key={index}>
                <div className="review-header">
                  <span className="user-icon">👤</span>
                  <h4>{item.name}</h4>
                </div>

                <span className="review-time">2 weeks ago</span>

                <div className="review-stars">★★★★★</div>

                <p className="review-text">{item.review}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call To Action Section */}
      <section className="cta-section">
        <div className="cta-container">
          <div className="cta-left">
            <h2>Ready to Find Your Part</h2>

            <p>
              Contact us today for a quick quote on the exact <br />
              part you need. Our team is standing by to help
            </p>

            <button className="cta-btn">Start Your Search</button>
          </div>

          <div className="cta-right">
            <img src={bannerImage} alt="Auto Parts" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;