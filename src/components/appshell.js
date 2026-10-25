import BottomNav from "./bottomnavbar";
import TopNav from "./topnav";

/* Marco común de las pantallas. Se adapta al ancho:
   - celular: una columna + barra de navegación abajo
   - tablet / escritorio: contenedor más ancho + barra de navegación arriba
   `size` define cuánto crece: app (listas en grilla) · detail (foto + info) · form (formularios) */
const WIDTHS = {
  app: "max-w-md md:max-w-3xl lg:max-w-6xl",
  detail: "max-w-md md:max-w-4xl",
  form: "max-w-md md:max-w-xl",
};

export default function AppShell({ children, size = "app", bottomNav = true }) {
  return (
    <div className="min-h-dvh bg-bg">
      <div className={`mx-auto flex min-h-dvh w-full flex-col ${WIDTHS[size]}`}>
        <TopNav />
        {children}
        {bottomNav && <BottomNav />}
      </div>
    </div>
  );
}
