import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Fonts } from '@app/themes';
import { hexToRGB } from '@app/utils/helpers';
import { normalize } from '@app/utils/orientation';
import { isIos } from '@app/utils/helpers/Validation';

interface Rate {
  category: string;
  audio: string;
  video: string;
  onsite: string;
}

const CertifiedData: Rate[] = [
  {
    category: 'General',
    audio: '$112/hr',
    video: '$166/hr',
    onsite: '$132/hr',
  },
  {
    category: 'Medical',
    audio: '$112/hr',
    video: '$166/hr',
    onsite: '$132/hr',
  },
  { category: 'Legal', audio: '$140/hr', video: '$144/hr', onsite: '$152/hr' },
  { category: 'ASL', audio: '$144/hr', video: '$148/hr', onsite: '$156/hr' },
  {
    category: 'Simultaneous\n(half-day min)',
    audio: '$160/hr',
    video: '$168/hr',
    onsite: '$180/hr',
  },
];

const QualifiedData: Rate[] = [
  { category: 'General', audio: '$64/hr', video: '$68/hr', onsite: '$72/hr' },
  { category: 'Medical', audio: '$64/hr', video: '$68/hr', onsite: '$72/hr' },
  { category: 'Legal', audio: '$68/hr', video: '$72/hr', onsite: '$80/hr' },
  { category: 'ASL', audio: '$72/hr', video: '$76/hr', onsite: '$84/hr' },
  {
    category: 'Simultaneous\n(half-day min)',
    audio: '$88/hr',
    video: '$96/hr',
    onsite: '$108/hr',
  },
];

const TAB_TITLES = ['Certified Interpreter', 'Qualified Interpreter'];
const HEADER_COLUMNS = ['Audio', 'Video', 'On-site'];

export const RatesTable: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState(0);

  const data = selectedTab === 0 ? CertifiedData : QualifiedData;

  const renderRateRow = (item: Rate, index: number, length: number) => (
    <View
      key={index}
      style={[
        styles.rateRow,
        { backgroundColor: index % 2 === 0 ? Colors.lilac : Colors.lace },
        index === length - 1 && styles.lastRow,
      ]}
    >
      {[item.audio, item.video, item.onsite].map((value, colIndex) => (
        <View style={styles.cell} key={colIndex}>
          <Text style={styles.cellText}>{value}</Text>
        </View>
      ))}
    </View>
  );

  return (
    <View>
      {/* Tab Selector */}
      <View style={styles.selectionContainer}>
        {TAB_TITLES.map((title, index) => {
          const isActive = index === selectedTab;
          return (
            <TouchableOpacity
              key={index}
              onPress={() => setSelectedTab(index)}
              style={isActive ? styles.selectionItem : styles.deSelectionItem}
            >
              <Text
                style={
                  isActive ? styles.selectionTitle : styles.deSelectionTitle
                }
              >
                {title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Table */}
      <View style={styles.tableContainer}>
        {/* Category Column */}
        <View style={styles.categoryColumn}>
          <View style={styles.emptyHeaderCell} />
          {data.map((item, index) => (
            <View key={index} style={styles.categoryCell}>
              <Text style={styles.categoryText}>{item.category}</Text>
            </View>
          ))}
        </View>

        {/* Rates Column */}
        <View style={styles.ratesColumn}>
          {/* Header Row */}
          <View style={styles.headerRow}>
            {HEADER_COLUMNS.map((col, index) => (
              <View style={styles.cell} key={index}>
                <Text style={styles.headerText}>{col}</Text>
              </View>
            ))}
          </View>
          {/* Data Rows */}
          {data.map((item, index) => renderRateRow(item, index, data.length))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  selectionContainer: {
    backgroundColor: Colors.alabaster,
    height: normalize(45),
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: normalize(9),
    borderColor: Colors.blue_chalk,
    borderWidth: normalize(1.5),
    padding: normalize(3),
    marginBottom: normalize(12),
  },
  selectionItem: {
    backgroundColor: Colors.white,
    width: '48%',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: hexToRGB(Colors.melrose, isIos() ? 0.4 : 1),
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: normalize(10),
    elevation: 10,
    borderRadius: normalize(8),
  },
  deSelectionItem: {
    width: '48%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionTitle: {
    fontFamily: Fonts.Inter_Medium,
    color: Colors.night_blue,
    fontSize: normalize(12),
  },
  deSelectionTitle: {
    fontFamily: Fonts.Inter_Regular,
    color: Colors.dark_grey,
    fontSize: normalize(12),
  },
  tableContainer: {
    backgroundColor: Colors.magnolia,
    borderRadius: normalize(12),
    flexDirection: 'row',
    width: '100%',
    marginBottom: normalize(20),
  },
  categoryColumn: {
    width: '25%',
  },
  ratesColumn: {
    width: '75%',
  },
  emptyHeaderCell: {
    height: normalize(38),
  },
  categoryCell: {
    height: normalize(38),
    justifyContent: 'center',
    paddingLeft: normalize(8),
  },
  categoryText: {
    fontFamily: Fonts.Inter_Regular,
    color: Colors.night_blue,
    fontSize: normalize(8.5),
  },
  headerRow: {
    backgroundColor: Colors.aztec_purple,
    borderTopLeftRadius: normalize(10),
    borderTopRightRadius: normalize(10),
    width: '100%',
    flexDirection: 'row',
    height: normalize(38),
  },
  headerText: {
    fontFamily: Fonts.Inter_Medium,
    color: Colors.white,
    fontSize: normalize(11),
  },
  rateRow: {
    flexDirection: 'row',
    height: normalize(37.5),
    marginBottom: normalize(1),
  },
  lastRow: {
    borderBottomLeftRadius: normalize(10),
    borderBottomRightRadius: normalize(10),
    height: normalize(38),
    marginBottom: 0,
  },
  cell: {
    width: '33.3%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellText: {
    fontFamily: Fonts.Inter_Regular,
    color: Colors.night_blue,
    fontSize: normalize(10),
  },
});
