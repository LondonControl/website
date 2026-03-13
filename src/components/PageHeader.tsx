interface Props {
  eyebrow: string;
  title: string;
}

const PageHeader: React.FC<Props> = ({ eyebrow, title }) => (
  <div className="border-b border-border pb-8" data-testid="page-header">
    <span className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
      {eyebrow}
    </span>
    <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground tablet:text-4xl">
      {title}
    </h1>
  </div>
);

export default PageHeader;
