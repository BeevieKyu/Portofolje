
/**
 * this dile centralizes inpur rules in one place, keeps route cleaner,
 * 		reauses helpers to avoid duplication and trims content before storing
 */
const COMMENT_MAX_LENGTH = 500;
const LEADERBOARD_CATEGORIES = ['elo', 'wins', 'winPercentage', 'matches'];
const USER_TYPES = ['anonymous', 'registered', 'admin'];

/**
 * Utility checks follow, like: 
 * valid variant pbject, positive int, non empty string, email regex, valid game players
 * 	calid comment author and content trimming
 */
function hasValidVariant(variant) {
	return variant
		&& [3, 5, 7].includes(Number(variant.rounds))
		&& variant.straightsAllowed !== undefined
		&& [3, 10, 30].includes(Number(variant.timePerRound));
}

function hasValidMatchPreferences(preferences) {
	if (preferences === undefined) return true;
	if (!preferences || typeof preferences !== 'object') return false;

	if (preferences.allowAnonymous !== undefined && typeof preferences.allowAnonymous !== 'boolean') {
		return false;
	}

	const minElo = preferences.minElo;
	const maxElo = preferences.maxElo;

	if (minElo !== undefined && minElo !== null && !Number.isFinite(Number(minElo))) {
		return false;
	}

	if (maxElo !== undefined && maxElo !== null && !Number.isFinite(Number(maxElo))) {
		return false;
	}

	if (minElo !== undefined && minElo !== null && maxElo !== undefined && maxElo !== null) {
		if (Number(minElo) > Number(maxElo)) return false;
	}

	return true;
}

function isPositiveInteger(value) {
	const parsedValue = Number.parseInt(value, 10);
	return Number.isInteger(parsedValue) && parsedValue > 0;
}

function isNonEmptyString(value) {
	return typeof value === 'string' && value.trim().length > 0;
}

function isValidEmail(email) {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function hasValidGamePlayers(players) {
	return Array.isArray(players)
		&& players.length >= 1
		&& players.length <= 2
		&& players.every(player => player.type && ['registered', 'anonymous'].includes(player.type) && player.id);
}

function hasCompatibleGamePlayers(players) {
	if (!Array.isArray(players) || players.length <= 1) {
		return true;
	}

	const hasAnonymousPlayer = players.some(player => player.type === 'anonymous');
	const hasRegisteredPlayer = players.some(player => player.type === 'registered');

	return !(hasAnonymousPlayer && hasRegisteredPlayer);
}

function hasValidGamePlayer(player) {
	return player && player.type && ['registered', 'anonymous'].includes(player.type) && player.id;
}

function hasValidCommentAuthor(author) {
	return author
		&& author.type
		&& ['registered', 'anonymous', 'admin'].includes(author.type)
		&& author.id;
}

function getTrimmedContent(content) {
	return typeof content === 'string' ? content.trim() : '';
}

/**
 * generic shared middleware
 * sort parser, pagination validator
 */
export function buildSortObject(sort = '-createdAt') {
	return sort.startsWith('-') ? { [sort.substring(1)]: -1 } : { [sort]: 1 };
}

export function validatePagination(req, res, next) {
	const { page = 1, limit = 10 } = req.query;

	if (!isPositiveInteger(page) || !isPositiveInteger(limit)) {
		return res.status(400).json({ error: 'page and limit must be positive integers' });
	}

	req.pagination = {
		page: Number.parseInt(page, 10),
		limit: Number.parseInt(limit, 10)
	};

	next();
}

/**
 * register payloads, login payload and user update payload.
 */
export function validateRegister(req, res, next) {
	const { username, email, password, age } = req.body;

	if (!isNonEmptyString(username) || !isNonEmptyString(email) || !isNonEmptyString(password) || age === undefined) {
		return res.status(400).json({ error: 'username, email, password and age are required' });
	}

	if (!isValidEmail(email)) {
		return res.status(400).json({ error: 'A valid email is required' });
	}

	if (!Number.isInteger(Number(age)) || Number(age) < 18) {
		return res.status(400).json({ error: 'age must be a number of at least 18' });
	}

	next();
}

export function validateLogin(req, res, next) {
	const { email, password } = req.body;

	if (!isNonEmptyString(email) || !isNonEmptyString(password)) {
		return res.status(400).json({ error: 'email and password are required' });
	}

	if (!isValidEmail(email)) {
		return res.status(400).json({ error: 'A valid email is required' });
	}

	next();
}


export function validateLeaderboardQuery(req, res, next) {
	const { category = 'elo' } = req.query;

	if (!LEADERBOARD_CATEGORIES.includes(category)) {
		return res.status(400).json({ error: 'category must be one of: elo, wins, winPercentage, matches' });
	}

	next();
}

export function isAllowedUserType(userType) {
	return USER_TYPES.includes(userType);
}

/**
 * Leaderboard validator
 * check for elo, wins, winPrecentage and matches.
 */
export function validateGameQueue(req, res, next) {
	const { userId, variant } = req.body;

	if (!isNonEmptyString(userId)) {
		return res.status(400).json({ error: 'userId is required' });
	}

	if (!hasValidVariant(variant)) {
		return res.status(400).json({ error: 'variant must include rounds, straightsAllowed, and timePerRound' });
	}

	next();
}

/**
 * game req valisdators
 * Queue payload, game creation payload(including anonymousvs registered compatibility)
 * 	join payloas, result payload(winner, finnalScored, rolls, holds) 
 * 	game comment payloas(author rules, trim and max length)
 */
export function validateGameCreation(req, res, next) {
	const { variant, players, matchPreferences } = req.body;

	if (!hasValidVariant(variant)) {
		return res.status(400).json({ error: 'Variant is required with rounds, straightsAllowed, and timePerRound' });
	}

	if (!hasValidGamePlayers(players)) {
		return res.status(400).json({ error: '1 or 2 valid players are required' });
	}

	if (!hasCompatibleGamePlayers(players)) {
		return res.status(400).json({ error: 'Anonymous players can only play against other anonymous players' });
	}

	if (!hasValidMatchPreferences(matchPreferences)) {
		return res.status(400).json({ error: 'matchPreferences must include valid allowAnonymous/minElo/maxElo values' });
	}

	next();
}

export function validateGameJoin(req, res, next) {
	const { player } = req.body;

	if (!hasValidGamePlayer(player)) {
		return res.status(400).json({ error: 'Valid player (type and id) is required' });
	}

	next();
}

export function validateGameResult(req, res, next) {
	const { winner, finalScores, rolls, holds } = req.body;

	if (!winner || !finalScores || typeof finalScores.player1 !== 'number' || typeof finalScores.player2 !== 'number') {
		return res.status(400).json({ error: 'Winner and finalScores (player1, player2) are required' });
	}

	if (!Array.isArray(rolls) || !Array.isArray(holds)) {
		return res.status(400).json({ error: 'rolls and holds are required arrays' });
	}

	next();
}

export function validateGameComment(req, res, next) {
	const { author, content } = req.body;
	const trimmedContent = getTrimmedContent(content);

	if (!hasValidCommentAuthor(author)) {
		return res.status(400).json({ error: 'Valid author (type and id) is required' });
	}

	if (!['registered', 'admin'].includes(author.type)) {
		return res.status(400).json({ error: 'Only registered users and admins can comment on games' });
	}

	if (!trimmedContent) {
		return res.status(400).json({ error: 'Comment content is required' });
	}

	if (trimmedContent.length > COMMENT_MAX_LENGTH) {
		return res.status(400).json({ error: `Comment content must be ${COMMENT_MAX_LENGTH} characters or fewer` });
	}

	req.body.content = trimmedContent;
	next();
}

export function validateUserUpdate(req, res, next) {
	const { email, password, age, appearancePreferences } = req.body;

	// At least one updatable field must be present
	if (email === undefined && password === undefined && age === undefined && appearancePreferences === undefined) {
		return res.status(400).json({ error: 'Provide at least one of: email, password, age, appearancePreferences. Username cannot be updated' });
	}

	if (email !== undefined && !isValidEmail(email)) {
		return res.status(400).json({ error: 'Please enter a valid email' });
	}

	if (age !== undefined && (!Number.isInteger(Number(age)) || Number(age) < 18)) {
		return res.status(400).json({ error: 'you must be 18+ to play' });
	}

	if (password !== undefined && !isNonEmptyString(password)) {
		return res.status(400).json({ error: 'password cant be empty' });
	}

	if (appearancePreferences !== undefined) {
		if (!appearancePreferences || typeof appearancePreferences !== 'object') {
			return res.status(400).json({ error: 'appearancePreferences must be an object' });
		}

		const { isDarkMode, boardColor, soundEnabled, lobbyPreviewCount } = appearancePreferences;
		if (isDarkMode !== undefined && typeof isDarkMode !== 'boolean') {
			return res.status(400).json({ error: 'appearancePreferences.isDarkMode must be boolean' });
		}
		if (boardColor !== undefined && !isNonEmptyString(boardColor)) {
			return res.status(400).json({ error: 'appearancePreferences.boardColor must be a non-empty string' });
		}
		if (soundEnabled !== undefined && typeof soundEnabled !== 'boolean') {
			return res.status(400).json({ error: 'appearancePreferences.soundEnabled must be boolean' });
		}
		if (lobbyPreviewCount !== undefined && !isPositiveInteger(lobbyPreviewCount)) {
			return res.status(400).json({ error: 'appearancePreferences.lobbyPreviewCount must be a positive integer' });
		}
	}

	next();
}

/**
 * tournament req validation
 * Tournament creating payloas, tournament join payload 
 * 	and tournament comment payload
 */
export function validateTournamentCreation(req, res, next) {
	const { title, variant, startDate, createdBy } = req.body;

	if (!title || !variant || !startDate || !createdBy) {
		return res.status(400).json({ error: 'title, variant, startDate and createdBy are required' });
	}

	if (!isNonEmptyString(createdBy)) {
		return res.status(400).json({ error: 'createdBy is required' });
	}

	if (!hasValidVariant(variant)) {
		return res.status(400).json({ error: 'variant must include rounds, straightsAllowed and timePerRound' });
	}

	next();
}

export function validateTournamentJoin(req, res, next) {
	const { userId } = req.body;

	if (!isNonEmptyString(userId)) {
		return res.status(400).json({ error: 'userId is required' });
	}

	next();
}

export function validateTournamentComment(req, res, next) {
	const { author, content } = req.body;
	const trimmedContent = getTrimmedContent(content);

	if (!author || !author.type || !author.id || !['registered', 'admin'].includes(author.type)) {
		return res.status(400).json({ error: 'author must be an object with type (registered|admin) and id' });
	}

	if (!trimmedContent) {
		return res.status(400).json({ error: 'content is required' });
	}

	if (trimmedContent.length > COMMENT_MAX_LENGTH) {
		return res.status(400).json({ error: `Comment content must be ${COMMENT_MAX_LENGTH} characters or fewer` });
	}

	req.body.content = trimmedContent;
	next();
}

