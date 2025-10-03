
import { cn } from "@/lib/utils";
import React from "react";

interface MarqueeProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  pauseOnHover?: boolean;
  reverse?: boolean;
  vertical?: boolean;
  repeat?: number;
  [key: string]: any;
}

const Marquee = React.forwardRef<HTMLDivElement, MarqueeProps>(
  (
    {
      className,
      pauseOnHover = false,
      reverse = false,
      vertical = false,
      repeat = 4,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        {...props}
        className={cn(
          "group flex overflow-hidden p-2 [--gap:1rem] [--duration:60s]",
          {
            "flex-row": !vertical,
            "flex-col": vertical,
          },
          className
        )}
      >
        {Array(repeat)
          .fill(0)
          .map((_, i) => (
            <div
              key={i}
              className={cn("flex shrink-0 justify-around [gap:var(--gap)]", {
                "group-hover:[animation-play-state:paused]": pauseOnHover,
                "[animation-direction:reverse]": reverse,
              })}
              style={{
                animation: `${vertical ? 'marquee-vertical' : 'marquee-horizontal'} var(--duration) linear infinite`,
              }}
            >
              {React.Children.map(children, (child) => 
                React.cloneElement(child as React.ReactElement, {
                  className: cn(
                    (child as React.ReactElement).props.className,
                    "rounded-2xl"
                  ),
                })
              )}
            </div>
          ))}
      </div>
    );
  }
);

Marquee.displayName = "Marquee";

export default Marquee;
