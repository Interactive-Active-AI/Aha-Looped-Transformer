export function niceScale(max){
 if(max<=0)return {top:4,step:1};
 const step=[1,2,5,10,20,25,50,100,200,500].find(s=>max/s<=4)||1000;
 return {top:Math.ceil(max/step)*step,step};
}
