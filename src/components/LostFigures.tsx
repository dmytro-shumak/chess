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
        {figures.map((figure) => (
          <div key={figure.id}>
            {figure.name}{" "}
            {figure.logo && <img src={figure.logo} alt={figure.name} width={20} height={20} />}
          </div>
        ))}
      </div>
    </div>
  );
}

export default LostFigures;
