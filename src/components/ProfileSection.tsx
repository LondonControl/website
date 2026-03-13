interface Props {
  id: string;
  title: string;
  first?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}

const ProfileSection: React.FC<Props> = ({
  id,
  title,
  first,
  danger,
  children,
}) => (
  <section
    id={id}
    className={`scroll-mt-28 ${first ? 'py-14' : 'border-t border-border py-10'}`}
  >
    <div className="mb-6 flex items-center gap-4">
      <h2
        className={`shrink-0 text-sm font-semibold uppercase tracking-[0.2em] ${
          danger ? 'text-destructive' : 'text-foreground'
        }`}
      >
        {title}
      </h2>
      <div
        className={`h-px flex-1 ${danger ? 'bg-destructive/20' : 'bg-border'}`}
      />
    </div>
    {children}
  </section>
);

export default ProfileSection;
