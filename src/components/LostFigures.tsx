import { Figure } from "../models/figures/Figure";

interface LostFiguresProps {
  title: string;
  figures: Figure[];
}

function LostFigures({ title, figures }: LostFiguresProps) {
  return (
    <div className="h-[calc(40vh-60px)] w-[calc(15vw-60px)] p-8 ml-12 rounded-[20%]">
      <h3 className="text-center">{title}</h3>
      <div className="h-full flex flex-col flex-wrap">
        {figures.map((figure) => {
          const Logo = figure.Logo;
          
          return (
            <div key={figure.id}>
              {figure.name}{" "}
              {Logo && <Logo width={20} height={20} aria-label={figure.name} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default LostFigures;
