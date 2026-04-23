export interface Slide {
  layout: 'title-overlay' | 'split-image' | 'icon-grid' | 'stats-callout' | 'quote' | 'chart' | 'svg-diagram' | 'image-collage';
  theme?: {
    bg: string;
    text: string;
    accent: string;
    font: 'inter' | 'playfair' | 'space' | 'jetbrains' | 'outfit';
    align: 'left' | 'center' | 'right';
  };
  title: string;
  subtitle?: string;
  content?: string[];
  imageKeyword?: string;
  imageKeywords?: string[];
  iconifyNames?: string[];
  stats?: { value: string; label: string }[];
  script?: string;
  chartData?: { name: string; value: number }[];
  chartType?: 'bar' | 'line' | 'pie';
  svgCode?: string;
}
