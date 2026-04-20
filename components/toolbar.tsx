import React from 'react';

type Props = {
  crumbs: string[];
  right?: React.ReactNode;
};

export function Toolbar({ crumbs, right }: Props) {
  return (
    <div className="toolbar">
      <div className="crumbs">
        {crumbs.map((c, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span className="sep">/</span>}
            <span className={i === crumbs.length - 1 ? 'cur' : ''}>{c}</span>
          </React.Fragment>
        ))}
      </div>
      <div className="spacer" />
      {right}
    </div>
  );
}
