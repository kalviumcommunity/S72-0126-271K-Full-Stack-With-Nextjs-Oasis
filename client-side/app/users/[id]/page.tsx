interface Props {
  params: { id: string };
}

export default async function UserProfile({ params }: Props) {
  const { id } = params;
  // Mock fetch user data
  const user = { id, name: "User " + id };

  return (
    <main className="flex flex-col items-center mt-10">
      <h2 className="text-xl font-bold">User Profile</h2>
      <p>ID: {user.id}</p>
      <p>Name: {user.name}</p>
    </main>
  );
}