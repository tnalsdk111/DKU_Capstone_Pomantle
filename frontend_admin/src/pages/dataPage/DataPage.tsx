import React from 'react';
import DataView from '../../components/dataView/DataView';
import {List} from 'react-window';
import './DataPage.css';
import { useEffect, useState } from 'react';
import { DBManager } from '../../managers/DBManager';
import { useAllData } from '../../components/useAllData/UseAllData';

// interface RowProps{
//   index: number;
//   style: React.CSSProperties;
// }

// const Row = ({ index, style, data }: any) => {
//   const { isMobile, items } = data;
  
//   if (isMobile) {
//     const item = items[index];
//     return (
//       <div style={{ ...style, display: 'flex', justifyContent: 'center', padding: '0 20px' }}>
//         {/* 모바일일 땐 카드가 부모 너비의 90% 정도를 차지하게 합니다 */}
//         {item && <div style={{ width: '90%' }}><DataItemCard item={item} /></div>}
//       </div>
//     );
//   }

//   const first = items[index * 2];
//   const second = items[index * 2 + 1];
//   return (
//     <div style={{ ...style, display: 'flex', justifyContent: 'center', gap: '2%', padding: '0 20px' }}>
//       {/* 2열일 땐 각각 45% 정도씩 차지하게 해서 창 크기에 따라 같이 줄어들게 합니다 */}
//       {first && <div style={{ width: '45%' }}><DataItemCard item={first} /></div>}
//       {second && <div style={{ width: '45%' }}><DataItemCard item={second} /></div>}
//     </div>
//   );
// };

function DataPage() {
  // const [windowSize, setWindowSize] = useState({
  //   width: window.innerWidth,
  //   height: window.innerHeight,
  // });

  // useEffect(() => {
  //   const handleResize = () => {
  //     setWindowSize({ width: window.innerWidth, height: window.innerHeight });
  //   };
  //   window.addEventListener('resize', handleResize);
  //   return () => window.removeEventListener('resize', handleResize);
  // }, []);

  // // 창 너비가 1000px보다 작으면 1열, 크면 2열로 결정
  // const isMobile = windowSize.width < 1000;
  // const columnCount = isMobile ? 1 : 2;

  // return (
  //   <div className="data-page-container">
  //     <List
  //       height={windowSize.height - 150}
  //       width={windowSize.width} // "100%" 대신 실제 너비 숫자를 넣어줍니다.
  //       itemCount={isMobile ? dummyData.length : Math.ceil(dummyData.length / 2)}
  //       itemSize={isMobile ? 600 : 550} // 모바일일 때 높이를 조금 더 여유 있게 조절
  //       itemData={{ isMobile, items: dummyData }}
  //     >
  //       {Row}
  //     </List>
  //   </div>
  // );
  
  // return (
  //   <List
  //     rowComponent={RowComponent}
  //     rowCount={1}
  //     rowHeight={1}
  //     rowProps={{}}
  //   />
  // )

  const dummyData = useAllData();

  return (
    <div className="data-page-container">
      <div className="data-grid">
        {dummyData.map((item) => (
          <DataView key={item.id} data={item} />
        ))}
      </div>
    </div>
  );
}

export default DataPage;
