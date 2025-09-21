
export type Theme = {
  name: string;
  colors: {
    light: { [key: string]: string };
    dark: { [key: string]: string };
  };
};

export const themes = [
  {
    name: 'default',
    colors: {
      light: {
        '--primary': '262 84% 59%',
        '--primary-foreground': '0 0% 98%',
      },
      dark: {
        '--primary': '262 84% 59%',
        '--primary-foreground': '0 0% 98%',
      }
    }
  },
  {
    name: 'AI',
    colors: {
       light: { '--primary': '210 100% 56%', '--primary-foreground': '0 0% 98%' },
       dark: { '--primary': '210 100% 56%', '--primary-foreground': '0 0% 98%' },
    }
  },
  {
    name: 'Technology',
    colors: {
      light: { '--primary': '210 100% 56%', '--primary-foreground': '0 0% 98%' },
      dark: { '--primary': '210 100% 56%', '--primary-foreground': '0 0% 98%' },
    }
  },
  {
    name: 'Future',
    colors: {
      light: { '--primary': '260 100% 60%', '--primary-foreground': '0 0% 98%' },
      dark: { '--primary': '260 100% 60%', '--primary-foreground': '0 0% 98%' },
    }
  },
  {
    name: 'Sustainability',
    colors: {
      light: { '--primary': '140 60% 45%', '--primary-foreground': '0 0% 98%' },
      dark: { '--primary': '140 60% 45%', '--primary-foreground': '0 0% 98%' },
    }
  },
   {
    name: 'Lifestyle',
    colors: {
      light: { '--primary': '340 82% 52%', '--primary-foreground': '0 0% 98%' },
      dark: { '--primary': '340 82% 52%', '--primary-foreground': '0 0% 98%' },
    }
  },
  {
    name: 'Environment',
    colors: {
      light: { '--primary': '140 60% 45%', '--primary-foreground': '0 0% 98%' },
      dark: { '--primary': '140 60% 45%', '--primary-foreground': '0 0% 98%' },
    }
  },
  {
    name: 'Remote Work',
    colors: {
      light: { '--primary': '190 80% 50%', '--primary-foreground': '0 0% 98%' },
      dark: { '--primary': '190 80% 50%', '--primary-foreground': '0 0% 98%' },
    }
  },
  {
    name: 'Productivity',
    colors: {
      light: { '--primary': '250 65% 55%', '--primary-foreground': '0 0% 98%' },
      dark: { '--primary': '250 65% 55%', '--primary-foreground': '0 0% 98%' },
    }
  },
  {
    name: 'Wellness',
    colors: {
      light: { '--primary': '30 90% 55%', '--primary-foreground': '0 0% 98%' },
      dark: { '--primary': '30 90% 55%', '--primary-foreground': '0 0% 98%' },
    }
  },
  {
    name: 'Minimalism',
    colors: {
      light: { '--primary': '240 5% 50%', '--primary-foreground': '0 0% 98%' },
      dark: { '--primary': '240 5% 70%', '--primary-foreground': '0 0% 98%' },
    }
  },
  {
    name: 'Philosophy',
    colors: {
      light: { '--primary': '39 100% 50%', '--primary-foreground': '0 0% 98%' },
      dark: { '--primary': '39 100% 50%', '--primary-foreground': '0 0% 98%' },
    }
  },
   {
    name: 'Ocean',
    colors: {
      light: { '--primary': '205 90% 45%', '--primary-foreground': '0 0% 98%' },
      dark: { '--primary': '205 90% 45%', '--primary-foreground': '0 0% 98%' },
    }
  },
  {
    name: 'Science',
    colors: {
      light: { '--primary': '220 70% 50%', '--primary-foreground': '0 0% 98%' },
      dark: { '--primary': '220 70% 50%', '--primary-foreground': '0 0% 98%' },
    }
  },
  {
    name: 'Exploration',
    colors: {
      light: { '--primary': '170 70% 40%', '--primary-foreground': '0 0% 98%' },
      dark: { '--primary': '170 70% 40%', '--primary-foreground': '0 0% 98%' },
    }
  },
];

export const getThemeByTagName = (tagName: string) => {
    const normalizedTagName = tagName.toLowerCase();
    const foundTheme = themes.find(theme => theme.name.toLowerCase() === normalizedTagName);
    return foundTheme || themes.find(theme => theme.name === 'default');
}
