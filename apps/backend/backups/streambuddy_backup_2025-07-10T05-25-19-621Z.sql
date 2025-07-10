--
-- PostgreSQL database dump
--

-- Dumped from database version 16.8 (Homebrew)
-- Dumped by pg_dump version 16.8 (Homebrew)

-- Started on 2025-07-10 12:25:19 WIB

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 2 (class 3079 OID 143802)
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- TOC entry 3798 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- TOC entry 881 (class 1247 OID 144231)
-- Name: games_category_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.games_category_enum AS ENUM (
    'moba',
    'fps',
    'battle_royale',
    'strategy',
    'rpg',
    'sports',
    'racing',
    'fighting',
    'puzzle',
    'casual',
    'board',
    'social',
    'sandbox',
    'other'
);


ALTER TYPE public.games_category_enum OWNER TO postgres;

--
-- TOC entry 884 (class 1247 OID 144267)
-- Name: games_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.games_status_enum AS ENUM (
    'active',
    'inactive',
    'coming_soon'
);


ALTER TYPE public.games_status_enum OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 222 (class 1259 OID 143977)
-- Name: chat_messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chat_messages (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "chatSessionId" uuid NOT NULL,
    "senderId" uuid,
    content text NOT NULL,
    metadata jsonb,
    media jsonb,
    reactions jsonb,
    translations jsonb,
    "deliveredAt" timestamp without time zone,
    "readAt" timestamp without time zone,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    type character varying(20) DEFAULT 'text'::character varying NOT NULL,
    status character varying(20) DEFAULT 'sent'::character varying NOT NULL
);


ALTER TABLE public.chat_messages OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 143939)
-- Name: chat_sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chat_sessions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "userId" uuid NOT NULL,
    title character varying(100),
    "gameId" uuid,
    participants jsonb,
    settings jsonb,
    metadata jsonb,
    "startedAt" timestamp without time zone,
    "endedAt" timestamp without time zone,
    "lastActivityAt" timestamp without time zone,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    type character varying(20) DEFAULT 'private'::character varying NOT NULL,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL
);


ALTER TABLE public.chat_sessions OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 143883)
-- Name: games; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.games (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(100) NOT NULL,
    slug character varying(100) NOT NULL,
    description text,
    category public.games_category_enum NOT NULL,
    status public.games_status_enum DEFAULT 'active'::public.games_status_enum NOT NULL,
    thumbnail character varying(255),
    banner character varying(255),
    metadata jsonb,
    features jsonb,
    "popularityScore" integer DEFAULT 0 NOT NULL,
    "userCount" integer DEFAULT 0 NOT NULL,
    "lastUpdatedAt" timestamp without time zone,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.games OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 143814)
-- Name: migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    "timestamp" bigint NOT NULL,
    name character varying NOT NULL
);


ALTER TABLE public.migrations OWNER TO postgres;

--
-- TOC entry 216 (class 1259 OID 143813)
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.migrations_id_seq OWNER TO postgres;

--
-- TOC entry 3799 (class 0 OID 0)
-- Dependencies: 216
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- TOC entry 225 (class 1259 OID 144333)
-- Name: query-result-cache; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."query-result-cache" (
    id integer NOT NULL,
    identifier character varying,
    "time" bigint NOT NULL,
    duration integer NOT NULL,
    query text NOT NULL,
    result text NOT NULL
);


ALTER TABLE public."query-result-cache" OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 144332)
-- Name: query-result-cache_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."query-result-cache_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."query-result-cache_id_seq" OWNER TO postgres;

--
-- TOC entry 3800 (class 0 OID 0)
-- Dependencies: 224
-- Name: query-result-cache_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."query-result-cache_id_seq" OWNED BY public."query-result-cache".id;


--
-- TOC entry 220 (class 1259 OID 143905)
-- Name: user_games; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_games (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "userId" uuid NOT NULL,
    "gameId" uuid NOT NULL,
    "playTime" integer DEFAULT 0 NOT NULL,
    "lastPlayedAt" timestamp without time zone,
    preferences jsonb,
    stats jsonb,
    "addedAt" timestamp without time zone,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL
);


ALTER TABLE public.user_games OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 144019)
-- Name: user_subscriptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_subscriptions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "userId" uuid NOT NULL,
    amount numeric(10,2) NOT NULL,
    currency character varying(3) DEFAULT 'USD'::character varying NOT NULL,
    "startsAt" timestamp without time zone NOT NULL,
    "expiresAt" timestamp without time zone NOT NULL,
    "cancelledAt" timestamp without time zone,
    "trialEndsAt" timestamp without time zone,
    features jsonb,
    billing jsonb,
    metadata jsonb,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    plan character varying(20) NOT NULL,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    "billingCycle" character varying(20) DEFAULT 'monthly'::character varying NOT NULL
);


ALTER TABLE public.user_subscriptions OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 143837)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    username character varying(100) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    "firstName" character varying(100),
    "lastName" character varying(100),
    avatar character varying(255),
    bio text,
    "emailVerified" boolean DEFAULT false NOT NULL,
    "emailVerifiedAt" timestamp without time zone,
    "lastLoginAt" timestamp without time zone,
    "lastLoginIp" character varying(45),
    preferences jsonb,
    metadata jsonb,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    role character varying(20) DEFAULT 'user'::character varying NOT NULL,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 3557 (class 2604 OID 143817)
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- TOC entry 3591 (class 2604 OID 144336)
-- Name: query-result-cache id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."query-result-cache" ALTER COLUMN id SET DEFAULT nextval('public."query-result-cache_id_seq"'::regclass);


--
-- TOC entry 3789 (class 0 OID 143977)
-- Dependencies: 222
-- Data for Name: chat_messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.chat_messages (id, "chatSessionId", "senderId", content, metadata, media, reactions, translations, "deliveredAt", "readAt", "createdAt", "updatedAt", type, status) FROM stdin;
\.


--
-- TOC entry 3788 (class 0 OID 143939)
-- Dependencies: 221
-- Data for Name: chat_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.chat_sessions (id, "userId", title, "gameId", participants, settings, metadata, "startedAt", "endedAt", "lastActivityAt", "createdAt", "updatedAt", type, status) FROM stdin;
\.


--
-- TOC entry 3786 (class 0 OID 143883)
-- Dependencies: 219
-- Data for Name: games; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.games (id, name, slug, description, category, status, thumbnail, banner, metadata, features, "popularityScore", "userCount", "lastUpdatedAt", "createdAt", "updatedAt") FROM stdin;
64a65a9c-0417-4895-91b1-509cf6dcc346	Mobile Legends: Bang Bang	mobile-legends	Mobile MOBA game with 5v5 battles, popular in Indonesia	moba	active	/images/games/mobile-legends-thumb.jpg	/images/games/mobile-legends-banner.jpg	{"genres": ["MOBA", "Strategy", "Action"], "rating": "T", "platforms": ["Android", "iOS"], "publisher": "Moonton", "playerCount": {"max": 10, "min": 1}, "releaseDate": "2016-07-14"}	{"hasChat": true, "hasVideo": false, "hasVoice": true, "hasStreaming": true, "hasTournaments": true, "hasLeaderboards": true}	95	1500000	\N	2025-07-10 10:20:14.236069	2025-07-10 10:20:14.236069
a0aaaa8a-065b-47f5-823a-85f5ff1e3ad6	Arena of Valor	arena-of-valor	Fast-paced MOBA with unique heroes and intense battles	moba	active	/images/games/arena-of-valor-thumb.jpg	/images/games/arena-of-valor-banner.jpg	{"genres": ["MOBA", "Strategy"], "rating": "T", "platforms": ["Android", "iOS"], "publisher": "Tencent Games", "playerCount": {"max": 10, "min": 1}, "releaseDate": "2016-10-14"}	{"hasChat": true, "hasVideo": false, "hasVoice": true, "hasStreaming": true, "hasTournaments": true, "hasLeaderboards": true}	85	800000	\N	2025-07-10 10:20:14.248884	2025-07-10 10:20:14.248884
57c47081-0509-46d1-b159-442a7ce5af01	PUBG Mobile	pubg-mobile	Battle royale shooter with intense survival gameplay	fps	active	/images/games/pubg-mobile-thumb.jpg	/images/games/pubg-mobile-banner.jpg	{"genres": ["FPS", "Battle Royale", "Survival"], "rating": "T", "platforms": ["Android", "iOS"], "publisher": "PUBG Corporation", "playerCount": {"max": 100, "min": 1}, "releaseDate": "2018-03-19"}	{"hasChat": true, "hasVideo": false, "hasVoice": true, "hasStreaming": true, "hasTournaments": true, "hasLeaderboards": true}	90	2000000	\N	2025-07-10 10:20:14.250771	2025-07-10 10:20:14.250771
7eb840bd-17a3-42a9-bdcc-a41d4c55ab5b	Free Fire	free-fire	Fast-paced battle royale with unique characters	fps	active	/images/games/free-fire-thumb.jpg	/images/games/free-fire-banner.jpg	{"genres": ["FPS", "Battle Royale"], "rating": "T", "platforms": ["Android", "iOS"], "publisher": "Garena", "playerCount": {"max": 50, "min": 1}, "releaseDate": "2017-09-30"}	{"hasChat": true, "hasVideo": false, "hasVoice": true, "hasStreaming": true, "hasTournaments": true, "hasLeaderboards": true}	88	1800000	\N	2025-07-10 10:20:14.252951	2025-07-10 10:20:14.252951
45bddb2c-f227-48d4-aa66-9176cd74e681	Genshin Impact	genshin-impact	Open-world action RPG with stunning graphics	rpg	active	/images/games/genshin-impact-thumb.jpg	/images/games/genshin-impact-banner.jpg	{"genres": ["RPG", "Action", "Adventure"], "rating": "T", "platforms": ["Android", "iOS", "PC", "PS4"], "publisher": "miHoYo", "playerCount": {"max": 4, "min": 1}, "releaseDate": "2020-09-28"}	{"hasChat": true, "hasVideo": false, "hasVoice": false, "hasStreaming": true, "hasTournaments": false, "hasLeaderboards": true}	92	1200000	\N	2025-07-10 10:20:14.255536	2025-07-10 10:20:14.255536
ead432cf-0107-4d1c-8eee-5e434be5c4fb	Clash of Clans	clash-of-clans	Build your village and battle other players	strategy	active	/images/games/clash-of-clans-thumb.jpg	/images/games/clash-of-clans-banner.jpg	{"genres": ["Strategy", "Base Building"], "rating": "T", "platforms": ["Android", "iOS"], "publisher": "Supercell", "playerCount": {"max": 50, "min": 1}, "releaseDate": "2012-08-02"}	{"hasChat": true, "hasVideo": false, "hasVoice": false, "hasStreaming": true, "hasTournaments": true, "hasLeaderboards": true}	87	900000	\N	2025-07-10 10:20:14.257434	2025-07-10 10:20:14.257434
2cdd2cde-5101-4eb5-9143-feae3362d9e5	Clash Royale	clash-royale	Real-time strategy card game with tower defense	strategy	active	/images/games/clash-royale-thumb.jpg	/images/games/clash-royale-banner.jpg	{"genres": ["Strategy", "Card Game"], "rating": "T", "platforms": ["Android", "iOS"], "publisher": "Supercell", "playerCount": {"max": 2, "min": 1}, "releaseDate": "2016-03-02"}	{"hasChat": true, "hasVideo": false, "hasVoice": false, "hasStreaming": true, "hasTournaments": true, "hasLeaderboards": true}	83	700000	\N	2025-07-10 10:20:14.258674	2025-07-10 10:20:14.258674
860af160-1890-4eab-a7be-21e0891cf201	eFootball PES 2024	efootball-pes-2024	Realistic football simulation game	sports	active	/images/games/efootball-pes-thumb.jpg	/images/games/efootball-pes-banner.jpg	{"genres": ["Sports", "Simulation"], "rating": "E", "platforms": ["Android", "iOS", "PC", "PS4", "PS5"], "publisher": "Konami", "playerCount": {"max": 22, "min": 1}, "releaseDate": "2023-09-14"}	{"hasChat": true, "hasVideo": false, "hasVoice": true, "hasStreaming": true, "hasTournaments": true, "hasLeaderboards": true}	78	500000	\N	2025-07-10 10:20:14.259853	2025-07-10 10:20:14.259853
c55549fe-3eac-4779-b107-22e2136a34dd	Asphalt 9: Legends	asphalt-9-legends	High-octane racing with stunning graphics	racing	active	/images/games/asphalt-9-thumb.jpg	/images/games/asphalt-9-banner.jpg	{"genres": ["Racing", "Action"], "rating": "T", "platforms": ["Android", "iOS"], "publisher": "Gameloft", "playerCount": {"max": 8, "min": 1}, "releaseDate": "2018-07-25"}	{"hasChat": true, "hasVideo": false, "hasVoice": false, "hasStreaming": true, "hasTournaments": true, "hasLeaderboards": true}	75	400000	\N	2025-07-10 10:20:14.262317	2025-07-10 10:20:14.262317
064899f4-5cf2-4ef2-9095-5ab351de39a5	Street Fighter: Duel	street-fighter-duel	Mobile fighting game with classic characters	fighting	active	/images/games/street-fighter-duel-thumb.jpg	/images/games/street-fighter-duel-banner.jpg	{"genres": ["Fighting", "Action"], "rating": "T", "platforms": ["Android", "iOS"], "publisher": "Capcom", "playerCount": {"max": 2, "min": 1}, "releaseDate": "2023-02-28"}	{"hasChat": true, "hasVideo": false, "hasVoice": false, "hasStreaming": true, "hasTournaments": true, "hasLeaderboards": true}	72	300000	\N	2025-07-10 10:20:14.265261	2025-07-10 10:20:14.265261
9a0756ea-f7d6-45d6-bcde-7676ab15a73f	Candy Crush Saga	candy-crush-saga	Addictive match-3 puzzle game	puzzle	active	/images/games/candy-crush-thumb.jpg	/images/games/candy-crush-banner.jpg	{"genres": ["Puzzle", "Casual"], "rating": "E", "platforms": ["Android", "iOS", "Facebook"], "publisher": "King", "playerCount": {"max": 1, "min": 1}, "releaseDate": "2012-04-12"}	{"hasChat": false, "hasVideo": false, "hasVoice": false, "hasStreaming": false, "hasTournaments": false, "hasLeaderboards": true}	70	250000	\N	2025-07-10 10:20:14.266976	2025-07-10 10:20:14.266976
7be2eef8-8d00-4090-9fcd-f43e4609ce30	Call of Duty: Mobile	call-of-duty-mobile	Official Call of Duty mobile game with intense multiplayer battles	fps	active	/images/games/cod-mobile-thumb.jpg	/images/games/cod-mobile-banner.jpg	{"genres": ["FPS", "Action", "Multiplayer"], "rating": "T", "region": "Global", "platforms": ["Android", "iOS"], "publisher": "Activision", "playerCount": {"max": 100, "min": 1}, "releaseDate": "2019-10-01", "serverRegions": ["Asia", "Indonesia"]}	{"hasChat": true, "hasVideo": false, "hasVoice": true, "hasStreaming": true, "hasTournaments": true, "hasLeaderboards": true}	89	1800000	\N	2025-07-10 11:32:56.768082	2025-07-10 11:32:56.768082
a39ef8c9-f9f3-4bcd-8396-01fc0173088b	Valorant Mobile	valorant-mobile	Tactical shooter with unique agents and abilities	fps	active	/images/games/valorant-mobile-thumb.jpg	/images/games/valorant-mobile-banner.jpg	{"genres": ["FPS", "Tactical", "Strategy"], "rating": "T", "region": "Global", "platforms": ["Android", "iOS"], "publisher": "Riot Games", "playerCount": {"max": 10, "min": 5}, "releaseDate": "2024-01-01", "serverRegions": ["Asia", "Indonesia"]}	{"hasChat": true, "hasVideo": false, "hasVoice": true, "hasStreaming": true, "hasTournaments": true, "hasLeaderboards": true}	85	1200000	\N	2025-07-10 11:32:56.781081	2025-07-10 11:32:56.781081
d97dfb08-e608-49b9-b7fb-5df6f6e6cb1c	Honkai: Star Rail	honkai-star-rail	Space fantasy RPG with turn-based combat	rpg	active	/images/games/honkai-star-rail-thumb.jpg	/images/games/honkai-star-rail-banner.jpg	{"genres": ["RPG", "Turn-based", "Strategy"], "rating": "T", "region": "Global", "platforms": ["Android", "iOS", "PC"], "publisher": "miHoYo", "playerCount": {"max": 4, "min": 1}, "releaseDate": "2023-04-26", "serverRegions": ["Asia", "Indonesia"]}	{"hasChat": true, "hasVideo": false, "hasVoice": false, "hasStreaming": true, "hasTournaments": false, "hasLeaderboards": true}	88	950000	\N	2025-07-10 11:32:56.784064	2025-07-10 11:32:56.784064
c4c5041b-7f65-4d28-a838-bc2edbe31422	Honkai Impact 3rd	honkai-impact-3rd	Action RPG with stunning anime-style graphics	rpg	active	/images/games/honkai-impact-thumb.jpg	/images/games/honkai-impact-banner.jpg	{"genres": ["RPG", "Action", "Anime"], "rating": "T", "region": "Global", "platforms": ["Android", "iOS", "PC"], "publisher": "miHoYo", "playerCount": {"max": 4, "min": 1}, "releaseDate": "2016-10-14", "serverRegions": ["Asia", "Indonesia"]}	{"hasChat": true, "hasVideo": false, "hasVoice": false, "hasStreaming": true, "hasTournaments": false, "hasLeaderboards": true}	82	650000	\N	2025-07-10 11:32:56.801756	2025-07-10 11:32:56.801756
95abec3e-17e0-479d-9adb-e8e1b8569570	FIFA Mobile	fifa-mobile	Official FIFA mobile football game with real players and teams	sports	active	/images/games/fifa-mobile-thumb.jpg	/images/games/fifa-mobile-banner.jpg	{"genres": ["Sports", "Football", "Simulation"], "rating": "E", "region": "Global", "platforms": ["Android", "iOS"], "publisher": "EA Sports", "playerCount": {"max": 22, "min": 1}, "releaseDate": "2016-10-11", "serverRegions": ["Asia", "Indonesia"]}	{"hasChat": true, "hasVideo": false, "hasVoice": true, "hasStreaming": true, "hasTournaments": true, "hasLeaderboards": true}	80	750000	\N	2025-07-10 11:32:56.806352	2025-07-10 11:32:56.806352
\.


--
-- TOC entry 3784 (class 0 OID 143814)
-- Dependencies: 217
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.migrations (id, "timestamp", name) FROM stdin;
1	1700000000000	CreateInitialTables1700000000000
\.


--
-- TOC entry 3792 (class 0 OID 144333)
-- Dependencies: 225
-- Data for Name: query-result-cache; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."query-result-cache" (id, identifier, "time", duration, query, result) FROM stdin;
\.


--
-- TOC entry 3787 (class 0 OID 143905)
-- Dependencies: 220
-- Data for Name: user_games; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_games (id, "userId", "gameId", "playTime", "lastPlayedAt", preferences, stats, "addedAt", "createdAt", "updatedAt", status) FROM stdin;
\.


--
-- TOC entry 3790 (class 0 OID 144019)
-- Dependencies: 223
-- Data for Name: user_subscriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_subscriptions (id, "userId", amount, currency, "startsAt", "expiresAt", "cancelledAt", "trialEndsAt", features, billing, metadata, "createdAt", "updatedAt", plan, status, "billingCycle") FROM stdin;
\.


--
-- TOC entry 3785 (class 0 OID 143837)
-- Dependencies: 218
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, email, password, "firstName", "lastName", avatar, bio, "emailVerified", "emailVerifiedAt", "lastLoginAt", "lastLoginIp", preferences, metadata, "createdAt", "updatedAt", role, status) FROM stdin;
815b873f-4317-498c-8b26-6ce8d7b1c5e8	admin	admin@streambuddy.com	$2b$10$2NVp1Oat7vm/wTq7r6rE6OCYdyp97SP9MI707PzSL0I7n1Hh3rd62	Admin	StreamBuddy	\N	\N	t	2025-07-10 10:20:14.336	\N	\N	{"theme": "dark", "privacy": {"showOnlineStatus": true, "profileVisibility": "public"}, "language": "id", "notifications": {"chat": true, "push": true, "email": true}}	{"referrer": "direct", "timezone": "Asia/Jakarta", "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)", "registrationSource": "manual"}	2025-07-10 10:20:14.808653	2025-07-10 10:20:14.808653	user	active
78d63811-9df8-42b2-886c-4983ada7909d	budi_gamer	budi@gmail.com	$2b$10$8T.cBoGD4isjXHJrIPW4wubaLWOKYwYstpWW0oUTwFnBp3vuYLfRS	Budi	Santoso	\N	Mobile Legends player sejak 2018. Suka main tank dan support!	t	2025-07-10 10:20:14.403	\N	\N	{"theme": "dark", "privacy": {"showOnlineStatus": true, "profileVisibility": "friends"}, "language": "id", "notifications": {"chat": true, "push": true, "email": false}}	{"referrer": "google", "timezone": "Asia/Jakarta", "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0)", "registrationSource": "web"}	2025-07-10 10:20:14.814779	2025-07-10 10:20:14.814779	user	active
17c3ccfd-a2c1-4338-a47e-092b93c7b5da	sari_queen	sari@yahoo.com	$2b$10$pjgZh4fJ1Tw6r3WHyaEt5.FP310B6sP.0KJimTSZoHMJz6Ows2v62	Sari	Wijaya	\N	Gamer girl yang suka PUBG Mobile dan Free Fire. Pro player!	t	2025-07-10 10:20:14.47	\N	\N	{"theme": "light", "privacy": {"showOnlineStatus": false, "profileVisibility": "public"}, "language": "id", "notifications": {"chat": true, "push": true, "email": true}}	{"referrer": "instagram", "timezone": "Asia/Jakarta", "userAgent": "Mozilla/5.0 (Android 12)", "registrationSource": "mobile"}	2025-07-10 10:20:14.816711	2025-07-10 10:20:14.816711	user	active
b39eb822-cd81-44a9-8f21-f56eb9ca968e	rudi_clash	rudi@hotmail.com	$2b$10$7akcz3igBaHGwOHgJLpkwuE6/AYYH7H2QLEwQaw/P./ZpPOZAVwHG	Rudi	Hidayat	\N	Clash of Clans veteran. TH14 maxed out!	t	2025-07-10 10:20:14.538	\N	\N	{"theme": "dark", "privacy": {"showOnlineStatus": true, "profileVisibility": "friends"}, "language": "id", "notifications": {"chat": false, "push": true, "email": false}}	{"referrer": "facebook", "timezone": "Asia/Jakarta", "userAgent": "Mozilla/5.0 (Windows NT 10.0)", "registrationSource": "web"}	2025-07-10 10:20:14.81846	2025-07-10 10:20:14.81846	user	active
14e99fbe-5fa9-4af7-88f6-3166feca94ca	dewi_genshin	dewi@gmail.com	$2b$10$yqbQYDs.zVx46viWT/KQCu2sUTLOoOrN1S3HkAj5VIbCsRbYdPy1u	Dewi	Kusuma	\N	Genshin Impact player. AR60, semua karakter 5*!	t	2025-07-10 10:20:14.605	\N	\N	{"theme": "dark", "privacy": {"showOnlineStatus": true, "profileVisibility": "public"}, "language": "en", "notifications": {"chat": true, "push": false, "email": true}}	{"referrer": "tiktok", "timezone": "Asia/Jakarta", "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0)", "registrationSource": "mobile"}	2025-07-10 10:20:14.82026	2025-07-10 10:20:14.82026	user	active
9eb00095-b89a-4212-a7be-8b799334987c	andi_fps	andi@outlook.com	$2b$10$N02BJsat/Z5ufSU73lmey.yhpqU21qIaySKFV5OHTkiygghPGh6gu	Andi	Prasetyo	\N	FPS player. PUBG Mobile dan Free Fire specialist!	t	2025-07-10 10:20:14.672	\N	\N	{"theme": "dark", "privacy": {"showOnlineStatus": true, "profileVisibility": "friends"}, "language": "id", "notifications": {"chat": true, "push": true, "email": false}}	{"referrer": "youtube", "timezone": "Asia/Jakarta", "userAgent": "Mozilla/5.0 (Android 11)", "registrationSource": "web"}	2025-07-10 10:20:14.822111	2025-07-10 10:20:14.822111	user	active
5353ddad-24d4-4c71-846a-93d59c5cabb2	lina_moba	lina@gmail.com	$2b$10$75Uz.DUcChyNovZf5EzP.exSOMi.INuCXabEGzZWIOMeu50ftWFdS	Lina	Sari	\N	Mobile Legends player. Mythic rank, main mage dan assassin!	t	2025-07-10 10:20:14.738	\N	\N	{"theme": "light", "privacy": {"showOnlineStatus": false, "profileVisibility": "public"}, "language": "id", "notifications": {"chat": true, "push": true, "email": true}}	{"referrer": "twitter", "timezone": "Asia/Jakarta", "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0)", "registrationSource": "mobile"}	2025-07-10 10:20:14.823792	2025-07-10 10:20:14.823792	user	active
5ac6bd03-181c-4342-9cf9-2b07ba9eff99	tono_racing	tono@yahoo.com	$2b$10$2WJjLIWFF9IQ1gzlqU633uO/rwocGd2e99LWtGBGb9YpJKrsbLz4u	Tono	Saputra	\N	Racing game enthusiast. Asphalt 9 dan Real Racing 3 player!	t	2025-07-10 10:20:14.805	\N	\N	{"theme": "dark", "privacy": {"showOnlineStatus": true, "profileVisibility": "friends"}, "language": "id", "notifications": {"chat": false, "push": true, "email": false}}	{"referrer": "google", "timezone": "Asia/Jakarta", "userAgent": "Mozilla/5.0 (Android 10)", "registrationSource": "web"}	2025-07-10 10:20:14.825235	2025-07-10 10:20:14.825235	user	active
\.


--
-- TOC entry 3801 (class 0 OID 0)
-- Dependencies: 216
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.migrations_id_seq', 1, true);


--
-- TOC entry 3802 (class 0 OID 0)
-- Dependencies: 224
-- Name: query-result-cache_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."query-result-cache_id_seq"', 1, false);


--
-- TOC entry 3626 (class 2606 OID 143988)
-- Name: chat_messages PK_0a0a0a0a0a0a0a0a0a0a0a0a0a0a; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT "PK_0a0a0a0a0a0a0a0a0a0a0a0a0a0a" PRIMARY KEY (id);


--
-- TOC entry 3632 (class 2606 OID 144031)
-- Name: user_subscriptions PK_1b1b1b1b1b1b1b1b1b1b1b1b1b1b; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_subscriptions
    ADD CONSTRAINT "PK_1b1b1b1b1b1b1b1b1b1b1b1b1b1b" PRIMARY KEY (id);


--
-- TOC entry 3634 (class 2606 OID 144340)
-- Name: query-result-cache PK_6a98f758d8bfd010e7e10ffd3d3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."query-result-cache"
    ADD CONSTRAINT "PK_6a98f758d8bfd010e7e10ffd3d3" PRIMARY KEY (id);


--
-- TOC entry 3613 (class 2606 OID 143916)
-- Name: user_games PK_8b8b8b8b8b8b8b8b8b8b8b8b8b8; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_games
    ADD CONSTRAINT "PK_8b8b8b8b8b8b8b8b8b8b8b8b8b8" PRIMARY KEY (id);


--
-- TOC entry 3593 (class 2606 OID 143821)
-- Name: migrations PK_8c82d7f526340ab734260ea46be; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT "PK_8c82d7f526340ab734260ea46be" PRIMARY KEY (id);


--
-- TOC entry 3619 (class 2606 OID 143950)
-- Name: chat_sessions PK_9b9b9b9b9b9b9b9b9b9b9b9b9b9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_sessions
    ADD CONSTRAINT "PK_9b9b9b9b9b9b9b9b9b9b9b9b9b9" PRIMARY KEY (id);


--
-- TOC entry 3597 (class 2606 OID 143849)
-- Name: users PK_a3ffb1c0c8416b9fc6f907b7433; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY (id);


--
-- TOC entry 3606 (class 2606 OID 143895)
-- Name: games PK_c388b1d5e7de31cc72c30761e3f; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.games
    ADD CONSTRAINT "PK_c388b1d5e7de31cc72c30761e3f" PRIMARY KEY (id);


--
-- TOC entry 3599 (class 2606 OID 143853)
-- Name: users UQ_78a916df40e02a9deb1c4b75edb; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE (username);


--
-- TOC entry 3608 (class 2606 OID 143897)
-- Name: games UQ_7b8b8f8b8b8b8b8b8b8b8b8b8b8; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.games
    ADD CONSTRAINT "UQ_7b8b8f8b8b8b8b8b8b8b8b8b8b8" UNIQUE (slug);


--
-- TOC entry 3601 (class 2606 OID 143851)
-- Name: users UQ_fe0bb3f6570c403f5ece602dc73; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_fe0bb3f6570c403f5ece602dc73" UNIQUE (email);


--
-- TOC entry 3602 (class 1259 OID 144295)
-- Name: IDX_05318b3cbff2443bd581093bcb; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_05318b3cbff2443bd581093bcb" ON public.games USING btree (status);


--
-- TOC entry 3603 (class 1259 OID 144297)
-- Name: IDX_095bbaa4f028fa5a03e37f631d; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_095bbaa4f028fa5a03e37f631d" ON public.games USING btree (slug);


--
-- TOC entry 3609 (class 1259 OID 144298)
-- Name: IDX_1f35a6273ebc0cb50d852d07c5; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_1f35a6273ebc0cb50d852d07c5" ON public.user_games USING btree ("gameId");


--
-- TOC entry 3627 (class 1259 OID 144304)
-- Name: IDX_2dfab576863bc3f84d4f696227; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_2dfab576863bc3f84d4f696227" ON public.user_subscriptions USING btree ("userId");


--
-- TOC entry 3614 (class 1259 OID 144291)
-- Name: IDX_3ad88bbbc4e4d7e999dcf8df39; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_3ad88bbbc4e4d7e999dcf8df39" ON public.chat_sessions USING btree ("gameId");


--
-- TOC entry 3628 (class 1259 OID 144302)
-- Name: IDX_425f9deb8caa8a3d25e2133863; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_425f9deb8caa8a3d25e2133863" ON public.user_subscriptions USING btree (plan);


--
-- TOC entry 3615 (class 1259 OID 144293)
-- Name: IDX_4680547e20c7483edc930ab1c4; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_4680547e20c7483edc930ab1c4" ON public.chat_sessions USING btree (status);


--
-- TOC entry 3620 (class 1259 OID 144287)
-- Name: IDX_56a790ed62e868f2e0c5f81115; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_56a790ed62e868f2e0c5f81115" ON public.chat_messages USING btree (status);


--
-- TOC entry 3629 (class 1259 OID 144303)
-- Name: IDX_5970e6723936d28477041ebf85; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_5970e6723936d28477041ebf85" ON public.user_subscriptions USING btree (status);


--
-- TOC entry 3610 (class 1259 OID 144300)
-- Name: IDX_5fdcb87f82788ee0c1d1210331; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_5fdcb87f82788ee0c1d1210331" ON public.user_games USING btree ("userId", "gameId");


--
-- TOC entry 3621 (class 1259 OID 144290)
-- Name: IDX_94be4d12e248aacd9d8d1c09f7; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_94be4d12e248aacd9d8d1c09f7" ON public.chat_messages USING btree ("chatSessionId");


--
-- TOC entry 3594 (class 1259 OID 144306)
-- Name: IDX_97672ac88f789774dd47f7c8be; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_97672ac88f789774dd47f7c8be" ON public.users USING btree (email);


--
-- TOC entry 3616 (class 1259 OID 144292)
-- Name: IDX_a4af0218e63feb76e9f66c8788; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_a4af0218e63feb76e9f66c8788" ON public.chat_sessions USING btree (type);


--
-- TOC entry 3622 (class 1259 OID 144286)
-- Name: IDX_a6f359922fb93e42d1b2daf38d; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_a6f359922fb93e42d1b2daf38d" ON public.chat_messages USING btree ("createdAt");


--
-- TOC entry 3604 (class 1259 OID 144296)
-- Name: IDX_ceeed45af24a323bdeb92f3582; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_ceeed45af24a323bdeb92f3582" ON public.games USING btree (category);


--
-- TOC entry 3617 (class 1259 OID 144294)
-- Name: IDX_d0320df1059d8a029a460f4161; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_d0320df1059d8a029a460f4161" ON public.chat_sessions USING btree ("userId");


--
-- TOC entry 3623 (class 1259 OID 144288)
-- Name: IDX_d9291432be43c96357ab84b882; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_d9291432be43c96357ab84b882" ON public.chat_messages USING btree (type);


--
-- TOC entry 3611 (class 1259 OID 144299)
-- Name: IDX_f32a18072dfcadc634dd2fd266; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_f32a18072dfcadc634dd2fd266" ON public.user_games USING btree ("userId");


--
-- TOC entry 3630 (class 1259 OID 144301)
-- Name: IDX_f48398c923252db1a165b531d7; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_f48398c923252db1a165b531d7" ON public.user_subscriptions USING btree ("expiresAt");


--
-- TOC entry 3624 (class 1259 OID 144289)
-- Name: IDX_fc6b58e41e9a871dacbe9077de; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_fc6b58e41e9a871dacbe9077de" ON public.chat_messages USING btree ("senderId");


--
-- TOC entry 3595 (class 1259 OID 144305)
-- Name: IDX_fe0bb3f6520ee0469504521e71; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_fe0bb3f6520ee0469504521e71" ON public.users USING btree (username);


--
-- TOC entry 3635 (class 2606 OID 144322)
-- Name: user_games FK_1f35a6273ebc0cb50d852d07c5a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_games
    ADD CONSTRAINT "FK_1f35a6273ebc0cb50d852d07c5a" FOREIGN KEY ("gameId") REFERENCES public.games(id) ON DELETE CASCADE;


--
-- TOC entry 3639 (class 2606 OID 144327)
-- Name: user_subscriptions FK_2dfab576863bc3f84d4f6962274; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_subscriptions
    ADD CONSTRAINT "FK_2dfab576863bc3f84d4f6962274" FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 3638 (class 2606 OID 144307)
-- Name: chat_messages FK_94be4d12e248aacd9d8d1c09f70; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT "FK_94be4d12e248aacd9d8d1c09f70" FOREIGN KEY ("chatSessionId") REFERENCES public.chat_sessions(id) ON DELETE CASCADE;


--
-- TOC entry 3637 (class 2606 OID 144312)
-- Name: chat_sessions FK_d0320df1059d8a029a460f4161d; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_sessions
    ADD CONSTRAINT "FK_d0320df1059d8a029a460f4161d" FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 3636 (class 2606 OID 144317)
-- Name: user_games FK_f32a18072dfcadc634dd2fd266b; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_games
    ADD CONSTRAINT "FK_f32a18072dfcadc634dd2fd266b" FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE CASCADE;


-- Completed on 2025-07-10 12:25:19 WIB

--
-- PostgreSQL database dump complete
--

