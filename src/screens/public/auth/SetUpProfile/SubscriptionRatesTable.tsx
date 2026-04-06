import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Fonts } from '@app/themes';
import { hexToRGB } from '@app/utils/helpers';
import { normalize } from '@app/utils/orientation';
import { isIos } from '@app/utils/helpers/Validation';
import { useAppSelector } from '@app/store';

type InterpreterTypeInterface = 'Qualified' | 'Certified';

interface PricingDataInterface {
  _id: string;
  area_of_expertise_id: string;
  session_format_id: string;
  price: number | string | null;
  interpreter_type: InterpreterTypeInterface;
  status: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  areaofexpertiseDetails?: {
    _id: string;
    expertise_display_name: string;
  } | null;
  sessionformatDetails?: {
    _id: string;
    title: string;
  } | null;
}

interface Rate {
  category: string;
  price: {
    audio?: string;
    video?: string;
    onsite?: string;
  };
}

const TAB_TITLES: InterpreterTypeInterface[] = ['Certified', 'Qualified'];

export const SubscriptionRatesTable: React.FC = () => {
  const pricingListResponse: PricingDataInterface[] = useAppSelector(
    state => state.default.pricingListResponse,
  );

  const [selectedTab, setSelectedTab] =
    useState<InterpreterTypeInterface>('Certified');

  // SAFELY FORMAT DATA (using memo for performance)
  const pricingData = useMemo(() => {
    const formatted: Record<string, Rate> = {};

    if (!Array.isArray(pricingListResponse)) return [];

    pricingListResponse
      .filter(
        item =>
          item?.interpreter_type === selectedTab &&
          item?.areaofexpertiseDetails &&
          item?.sessionformatDetails,
      )
      .forEach(item => {
        const name =
          item.areaofexpertiseDetails?.expertise_display_name || 'N/A';

        const format =
          item.sessionformatDetails?.title?.toLowerCase()?.trim() || '';

        const priceValue = Number(item.price) || 0;

        if (!formatted[name]) {
          formatted[name] = {
            category: name,
            price: { audio: '', video: '', onsite: '' },
          };
        }

        if (format.includes('audio')) {
          formatted[name].price.audio = priceValue.toString();
        } else if (format.includes('video')) {
          formatted[name].price.video = priceValue.toString();
        } else if (format.includes('on-site') || format.includes('onsite')) {
          formatted[name].price.onsite = priceValue.toString();
        }
      });

    return Object.values(formatted);
  }, [pricingListResponse, selectedTab]);

  const renderRateRow = (item: Rate, index: number, length: number) => (
    <View
      key={index}
      style={[
        styles.rateRow,
        { backgroundColor: index % 2 === 0 ? Colors.lilac : Colors.lace },
        index === length - 1 && styles.lastRow,
      ]}
    >
      <View style={styles.cell}>
        <Text style={styles.cellText}>{item.price.audio}</Text>
      </View>
      <View style={styles.cell}>
        <Text style={styles.cellText}>{item.price.video}</Text>
      </View>
      <View style={styles.cell}>
        <Text style={styles.cellText}>{item.price.onsite}</Text>
      </View>
    </View>
  );

  return (
    <View>
      {/* Tab Selector */}
      <View style={styles.selectionContainer}>
        {TAB_TITLES.map((title, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => setSelectedTab(title)}
            style={
              title === selectedTab
                ? styles.selectionItem
                : styles.deSelectionItem
            }
          >
            <Text
              style={
                title === selectedTab
                  ? styles.selectionTitle
                  : styles.deSelectionTitle
              }
            >
              {title} Interpreter
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Table */}
      <View style={styles.tableContainer}>
        {/* Category Column */}
        <View style={styles.categoryColumn}>
          <View style={styles.emptyHeaderCell} />
          {pricingData.map((item, index) => (
            <View key={index} style={styles.categoryCell}>
              <Text style={styles.categoryText}>{item?.category}</Text>
            </View>
          ))}
        </View>

        {/* Rates Column */}
        <View style={styles.ratesColumn}>
          <View style={styles.headerRow}>
            <View style={styles.cell}>
              <Text style={styles.headerText}>Audio</Text>
            </View>
            <View style={styles.cell}>
              <Text style={styles.headerText}>Video</Text>
            </View>
            <View style={styles.cell}>
              <Text style={styles.headerText}>Onsite</Text>
            </View>
          </View>

          {pricingData.map((item, index) =>
            renderRateRow(item, index, pricingData.length),
          )}
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
