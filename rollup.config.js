import typescript from '@rollup/plugin-typescript';

export default [
  // Bundle for Web Components
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index.js',
        format: 'esm',
      },
      {
        file: 'dist/index.umd.js',
        format: 'umd',
        name: 'PureXml'
      }
    ],
    plugins: [
      typescript({ tsconfig: './tsconfig.json' })
    ]
  },
  // Bundle for React
  {
    input: 'src/react.ts',
    output: [
      {
        file: 'dist/react.js',
        format: 'esm',
      },
      {
        file: 'dist/react.umd.js',
        format: 'umd',
        name: 'PureXmlReact',
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        }
      }
    ],
    external: ['react', 'react-dom'],
    plugins: [
      typescript({ tsconfig: './tsconfig.json' })
    ]
  }
];
