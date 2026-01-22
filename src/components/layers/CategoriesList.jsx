import { NavLink } from "react-router-dom";

export default function CategoryCard({ category }) {

  return (
    <NavLink to={`/categorie/${category.id}`}>
    <button
      
      className="group relative overflow-hidden rounded-xl bg-white shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105"
    >
    
      <div className="aspect-square overflow-hidden">
        <img
          src={category.imageUrl}
          alt={category.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
        <div className="text-white">
          
            <h3 className="text-lg font-bold">{category.name}</h3>
          
          <p className="text-sm text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity">
            {category.description}
          </p>
        </div>
        
      </div>
     
      
     </button>
     </NavLink>
  );
}
