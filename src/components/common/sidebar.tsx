'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PanelRightOpen,
  ChevronsLeft,
  MessageSquare,
  Search,
  Plus,
  BookOpen,
  Settings,
} from 'lucide-react';

type Item = {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
};

const NAV_ITEMS: Item[] = [
  { label: 'Nuevo chat', href: '#', icon: MessageSquare },
  { label: 'Buscar', href: '#', icon: Search },
  { label: 'Biblioteca', href: '#', icon: BookOpen },
  { label: 'Crear', href: '#', icon: Plus },
  { label: 'Ajustes', href: '#', icon: Settings },
];

export default function Sidebar({
  logoSrc = '/logos/isotipo.svg',
  appName = 'Civix',
}: {
  logoSrc?: string;
  appName?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoverRail, setHoverRail] = useState(false);

  // Opcional: si querés que se “asome” al pasar el mouse, activá esto.
  const PEEK_ON_HOVER = false;

  return (
    <>
      {/* Overlay en mobile cuando está abierto */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            aria-hidden
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px] md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.aside
        className="group/sidebar sticky top-0 z-50 flex h-screen flex-col border-r border-zinc-800 bg-zinc-950 text-zinc-200"
        initial={false}
        animate={{
          width: isOpen ? 280 : 64,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onMouseEnter={() => {
          if (!isOpen) setHoverRail(true);
          if (PEEK_ON_HOVER && !isOpen) setIsOpen(true);
        }}
        onMouseLeave={() => {
          setHoverRail(false);
          if (PEEK_ON_HOVER) setIsOpen(false);
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-2 p-2">
          <button
            aria-label={isOpen ? 'Colapsar barra lateral' : 'Abrir barra lateral'}
            aria-expanded={isOpen}
            onClick={() => setIsOpen((v) => !v)}
            className="relative grid size-10 place-items-center rounded-xl hover:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-700"
          >
            {/* Estado: rail colapsada → logo que cambia a “abrir” en hover */}
            {!isOpen && (
              <>
                <Image
                  src={logoSrc}
                  alt="Logo"
                  width={22}
                  height={22}
                  className={`absolute transition-opacity duration-150 ${
                    hoverRail ? 'opacity-0' : 'opacity-100'
                  }`}
                  priority
                />
                <PanelRightOpen
                  size={20}
                  className={`absolute transition-opacity duration-150 ${
                    hoverRail ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              </>
            )}

            {/* Estado: expandido → botón de “colapsar” */}
            {isOpen && <ChevronsLeft size={18} />}
          </button>

          {/* Marca + nombre cuando está abierto */}
          <AnimatePresence initial={false}>
            {isOpen && (
              <motion.div
                className="flex min-w-0 items-center gap-2"
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
              >
                <Image src={logoSrc} alt="" width={18} height={18} />
                <span className="truncate font-semibold">{appName}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navegación */}
        <nav className="mt-2 grid gap-1 px-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className="group flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-zinc-900"
              >
                <Icon size={20} className="shrink-0" />
                {/* Etiqueta que aparece/desaparece con animación */}
                <motion.span
                  initial={false}
                  animate={{
                    opacity: isOpen ? 1 : 0,
                    x: isOpen ? 0 : -6,
                  }}
                  transition={{ duration: 0.15 }}
                  className={`truncate ${
                    isOpen ? 'block' : 'pointer-events-none hidden'
                  }`}
                >
                  {item.label}
                </motion.span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto p-2">
          {/* Perfil/usuario abajo, como en ChatGPT */}
          <button className="flex w-full items-center gap-3 rounded-lg p-2 hover:bg-zinc-900">
            <div className="grid size-8 place-items-center rounded-full bg-zinc-700 text-xs font-bold">
              N
            </div>
            <motion.span
              initial={false}
              animate={{ opacity: isOpen ? 1 : 0, x: isOpen ? 0 : -6 }}
              transition={{ duration: 0.15 }}
              className={`truncate ${isOpen ? 'block' : 'hidden'}`}
            >
              Nahuel Gomez Suarez
            </motion.span>
          </button>
        </div>
      </motion.aside>
    </>
  );
}
