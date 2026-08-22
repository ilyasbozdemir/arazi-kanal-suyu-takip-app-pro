export const DetailSection = (
  {
    title,
    icon: Icon,
    children,
    iconBg = "bg-primary-500/10",
    iconColor = "text-primary-500",
    className = ""
  }: any,
) => (
  <div className={`space-y-6 ${className}`}>
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-xl ${iconBg}`}>
        <Icon size={18} className={iconColor} />
      </div>
      <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest italic">
        {title}
      </h3>
    </div>
    <div className="w-full">
      {children}
    </div>
  </div>
);

