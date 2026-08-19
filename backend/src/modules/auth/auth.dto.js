export function toUserDto(user) {
  return {
    id: user.id,
    firstName: user.first_name,
    middleName: user.middle_name,
    lastName: user.last_name,
    phoneNumber: user.phone_number,
    email: user.email,
    role: user.role,
    idVerified: user.role === 'host' && Boolean(user.id_document_url),
    createdAt: user.created_at,
  };
}