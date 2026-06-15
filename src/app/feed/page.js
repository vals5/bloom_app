import FeedHeader from "@/components/feedheader";
import PetCard from "@/components/petcard";
import BottomNav from "@/components/bottomnavbar";
import { supabase } from "@/lib/supabase";

export default async function FeedPage() {
  let pets = [];
  
  try {
    const { data, error } = await supabase
      .from("pets")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error al traer mascotas de Supabase:", error.message);
    } else if (data) {
      pets = data;
    }
  } catch (err) {
    console.error("Error crítico en la consulta:", err);
  }

  return (
    <div className="min-h-screen bg-bg pb-20 flex justify-center">
      <div className="w-full max-w-md bg-bg min-h-screen flex flex-col shadow-2xl relative">
        
        <FeedHeader />

        <main className="flex-1 px-4 pt-4 overflow-y-auto bg-bg">
          {pets.length > 0 ? (
            pets.map((pet) => (
              <PetCard 
                key={pet.id} 
                pet={{
                  id: pet.id,
                  name: pet.name,
                  status: pet.status,     
                  date: pet.date,         
                  location: pet.location, 
                  gender: pet.gender,     
                  size: pet.size,         
                  imageUrl: pet.image_url 
                }} 
              />
            ))
          ) : (
            <div className="text-center py-12 text-mode text-sm">
              No hay publicaciones de mascotas por el momento.
            </div>
          )}
        </main>

        <BottomNav />
      </div>
    </div>
  );
}