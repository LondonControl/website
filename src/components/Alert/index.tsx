import { AlertTriangle, Info, ShieldAlert } from 'lucide-react';
import type { ReactNode } from 'react';

interface Props {
  type: 'info' | 'warning' | 'caution';
  children: ReactNode;
}

const getColours = (type: string) => {
  let colours;
  switch (type) {
    case 'info':
      colours = {
        element: 'border-gray-400 bg-gray-50',
        text: 'text-gray-700',
      };
      break;

    case 'warning':
      colours = {
        element: 'border-yellow-400 bg-yellow-50',
        text: 'text-yellow-700',
      };
      break;

    case 'caution':
      colours = {
        element: 'border-red-400 bg-red-50',
        text: 'text-red-700',
      };
      break;

    default:
      break;
  }

  return colours;
};

const getIcon = (type: string) => {
  let icon;
  switch (type) {
    case 'info':
      icon = <Info className="size-5" />;
      break;
    case 'warning':
      icon = <AlertTriangle className="size-5" />;
      break;
    case 'caution':
      icon = <ShieldAlert className="size-5" />;
      break;

    default:
      break;
  }

  return icon;
};

const Alert: React.FC<Props> = ({ type, children }) => {
  const colours = getColours(type);

  return (
    <div className={`border-l-4 p-4 ${colours?.element}`}>
      <div className="flex items-center">
        <div className={`shrink-0 ${colours?.text}`}>{getIcon(type)}</div>
        <div className="ml-3">
          <p className={`text-sm ${colours?.text}`}>{children}</p>
        </div>
      </div>
    </div>
  );
};

export default Alert;
