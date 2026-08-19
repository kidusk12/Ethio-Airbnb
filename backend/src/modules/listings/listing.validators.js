const categories = [
  'apartment',
  'villa',
  'hotel',
  'guesthouse',
  'private_room',
  'unique_stay',
];

const amenities = [
  'wifi',
  'kitchen',
  'free_parking',
  'washer',
];

function error(field, message) {
  return { field, message };
}

function isPositiveInteger(value) {
  return Number.isInteger(value) && value > 0;
}

function isPositiveNumber(value) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function validStringArray(value) {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

export function validateCreateListing(body) {
  const errors = [];

  if (!categories.includes(body.category)) {
    errors.push(error('category', 'Choose a valid property category.'));
  }

  if (!body.city?.trim()) {
    errors.push(error('city', 'City is required.'));
  }

  if (!body.subCity?.trim()) {
    errors.push(error('subCity', 'Sub-city is required.'));
  }

  if (!body.streetAddress?.trim()) {
    errors.push(error('streetAddress', 'Street address is required.'));
  }

  if (!body.houseDeedPhotoUrl?.trim()) {
    errors.push(
      error('houseDeedPhotoUrl', 'A house deed or rental-right image is required.'),
    );
  }

  if (!validStringArray(body.photos) || body.photos.length === 0) {
    errors.push(error('photos', 'Add at least one property photo.'));
  }

  if (!body.title?.trim() || body.title.trim().length > 150) {
    errors.push(error('title', 'Enter a listing title of up to 150 characters.'));
  }

  if (!body.description?.trim()) {
    errors.push(error('description', 'Description is required.'));
  }

  if (
    !Array.isArray(body.amenities) ||
    !body.amenities.every((item) => amenities.includes(item))
  ) {
    errors.push(
      error(
        'amenities',
        'Amenities may only include wifi, kitchen, free_parking, or washer.',
      ),
    );
  }

  if (!isPositiveInteger(body.bedrooms)) {
    errors.push(error('bedrooms', 'Bedrooms must be at least 1.'));
  }

  if (!isPositiveInteger(body.bathrooms)) {
    errors.push(error('bathrooms', 'Bathrooms must be at least 1.'));
  }

  if (!isPositiveInteger(body.maxGuests)) {
    errors.push(error('maxGuests', 'Maximum guests must be at least 1.'));
  }

  if (!isPositiveNumber(body.pricePerNight)) {
    errors.push(error('pricePerNight', 'Price per night must be greater than zero.'));
  }

  if (!validStringArray(body.houseRules)) {
    errors.push(error('houseRules', 'House rules must be a list of text values.'));
  }

  if (body.agreedToTerms !== true) {
    errors.push(
      error('agreedToTerms', 'You must agree to the Terms and Conditions.'),
    );
  }

  return errors;
}

export function validateUpdateListing(body) {
  const errors = [];

  if (body.category !== undefined && !categories.includes(body.category)) {
    errors.push(error('category', 'Choose a valid property category.'));
  }

  if (body.city !== undefined && !body.city.trim()) {
    errors.push(error('city', 'City cannot be empty.'));
  }

  if (body.subCity !== undefined && !body.subCity.trim()) {
    errors.push(error('subCity', 'Sub-city cannot be empty.'));
  }

  if (
    body.photos !== undefined &&
    (!validStringArray(body.photos) || body.photos.length === 0)
  ) {
    errors.push(error('photos', 'Add at least one property photo.'));
  }

  if (
    body.title !== undefined &&
    (!body.title.trim() || body.title.trim().length > 150)
  ) {
    errors.push(error('title', 'Enter a listing title of up to 150 characters.'));
  }

  if (body.amenities !== undefined) {
    if (
      !Array.isArray(body.amenities) ||
      !body.amenities.every((item) => amenities.includes(item))
    ) {
      errors.push(error('amenities', 'One or more amenities are invalid.'));
    }
  }

  for (const field of ['bedrooms', 'bathrooms', 'maxGuests']) {
    if (body[field] !== undefined && !isPositiveInteger(body[field])) {
      errors.push(error(field, `${field} must be at least 1.`));
    }
  }

  if (
    body.pricePerNight !== undefined &&
    !isPositiveNumber(body.pricePerNight)
  ) {
    errors.push(
      error('pricePerNight', 'Price per night must be greater than zero.'),
    );
  }

  if (
    body.houseRules !== undefined &&
    !validStringArray(body.houseRules)
  ) {
    errors.push(error('houseRules', 'House rules must be a list of text values.'));
  }

  return errors;
}