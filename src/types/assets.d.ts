// Metro trả về mã tài nguyên (số) khi import ảnh tĩnh; Image của React Native và expo-image đều
// nhận thẳng giá trị này làm `source`.
declare module '*.png' {
  const source: number;
  export default source;
}
