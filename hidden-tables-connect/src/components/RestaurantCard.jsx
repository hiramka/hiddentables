import Link from 'next/link';

export default function RestaurantCard({ restaurant }) {
  return (
    <Link href={`/restaurant/${restaurant.id}`}>
      <div className="border rounded-lg p-4 hover:shadow-lg transition cursor-pointer">
        <h3 className="font-bold text-lg">{restaurant.name}</h3>
        <p className="text-gray-600">{restaurant.description}</p>
        <p className="mt-2 text-sm text-gray-500">{restaurant.location}</p>
      </div>
    </Link>
  );
}