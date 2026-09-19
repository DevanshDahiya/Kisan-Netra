import { Link } from 'react-router-dom';

export default function Logo({ size = 'md', showSubtitle = true, link = true }) {
  const isLarge = size === 'lg';
  const isSmall = size === 'sm';

  const markSizeClass = isLarge ? 'w-11 h-11' : isSmall ? 'w-7 h-7' : 'w-9 h-9';
  const textTitleClass = isLarge ? 'text-2xl' : isSmall ? 'text-lg' : 'text-xl';
  const subtitleClass = isLarge ? 'text-xs' : 'text-[10px]';

  const Content = (
    <div className="flex items-center gap-2.5 group">
      {/* Custom Leaf + Pin Icon */}
      <div className={`${markSizeClass} flex-shrink-0 relative flex items-center justify-center rounded-xl bg-primary-50 dark:bg-darkSurface-card border border-primary-100 dark:border-darkSurface-border transition-all duration-200 group-hover:border-primary-400`}>
        <svg
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-4/5 h-4/5"
        >
          {/* Leaf Body resolving to Pin point at bottom */}
          <path
            d="M18 3.5C10.5 3.5 6 10.5 6 17.5C6 25.5 18 33.5 18 33.5C18 33.5 30 25.5 30 17.5C30 10.5 25.5 3.5 18 3.5Z"
            className="fill-primary-600 dark:fill-primary-500"
          />
          {/* Leaf Inner Vein Detail */}
          <path
            d="M18 4.5C18 14 12 19 8 20C10.5 25 15.5 29.5 18 32C20.5 29.5 25.5 25 28 20C24 19 18 14 18 4.5Z"
            className="fill-primary-400 dark:fill-primary-400 opacity-70"
          />
          {/* Geo Pin Point / Inner Target in Terracotta */}
          <circle
            cx="18"
            cy="17"
            r="3.8"
            className="fill-neutral-50 dark:fill-darkSurface-base stroke-accent-600 dark:stroke-accent-400"
            strokeWidth="2.2"
          />
          <circle
            cx="18"
            cy="17"
            r="1.4"
            className="fill-accent-600 dark:fill-accent-400"
          />
        </svg>
      </div>

      {/* Brand Typography in Space Grotesk */}
      <div className="flex flex-col">
        <span className={`font-display font-semibold tracking-tight leading-none text-neutral-900 dark:text-neutral-50 ${textTitleClass}`}>
          Kisan <span className="text-primary-600 dark:text-primary-400">Netra</span>
        </span>
        {showSubtitle && (
          <span className={`font-medium text-neutral-500 dark:text-neutral-400 tracking-wider uppercase leading-none mt-1 ${subtitleClass}`}>
            Licensed Agri Network
          </span>
        )}
      </div>
    </div>
  );

  if (!link) return Content;

  return (
    <Link to="/" className="inline-block focus:outline-none">
      {Content}
    </Link>
  );
}
