export function alignedScrollTop({scrollTop=0,anchorTop=0,containerTop=0,headerHeight=0,gap=0}={}){
 const values=[scrollTop,anchorTop,containerTop,headerHeight,gap].map(value=>Number.isFinite(Number(value))?Number(value):0);
 return Math.max(0,Math.round(values[0]+values[1]-values[2]-values[3]-values[4]));
}
