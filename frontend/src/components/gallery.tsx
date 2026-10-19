"use client";
import { useState } from "react";
export function Gallery({ images }: { images: { id:string; url:string }[] }) { const [selected, setSelected] = useState(0); return <div><img className="detail-image" src={images[selected]?.url} alt="결과 이미지" />{images.length > 1 && <div className="gallery-thumbs">{images.map((image,index) => <button className={index===selected ? "selected" : ""} onClick={() => setSelected(index)} key={image.id}><img src={image.url} alt="" /></button>)}</div>}</div>; }
