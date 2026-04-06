import React, { useState, useCallback, memo } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  ListRenderItem,
} from 'react-native';
import { Colors, Icons, Images } from '@app/themes';
import { normalize } from '@app/utils/orientation';
import MyStatusBar from '@app/utils/helpers/MyStatusBar';
import Header from '@app/components/common/Header';
import { disputesData, Dispute } from '@app/utils/constants';
import FooterLoader from '@app/utils/helpers/FooterLoader';
import { DisputeStatus } from '@app/types';
import Button from '@app/components/common/Button';
import { styles } from './styles';
import { navigate } from '@app/navigation/RootNaivgation';

const TABS: DisputeStatus[] = ['Pending', 'Declined', 'Resolved'];

const DisputeManagement = () => {
  const [activeTab, setActiveTab] = useState<DisputeStatus>('Pending');
  const [isLoading, setIsLoading] = useState(false);
  const [allItemsLoaded, setAllItemsLoaded] = useState(false);

  const filteredData = disputesData?.filter(d => d.status === activeTab);

  const LoadingFooter = useCallback(
    () => (isLoading && !allItemsLoaded ? <FooterLoader visible /> : null),
    [isLoading, allItemsLoaded],
  );

  const handleLoadMore = useCallback(() => {
    if (!isLoading && !allItemsLoaded) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setAllItemsLoaded(true);
      }, 1500);
    }
  }, [isLoading, allItemsLoaded]);

  const renderCard: ListRenderItem<Dispute> = useCallback(({ item }) => {
    const StatusTag = () => {
      let bgColor, borderColor, icon, textColor, label;

      switch (item.status) {
        case 'Declined':
          bgColor = '#FFEAE8';
          borderColor = '#FFE0DC';
          icon = Icons.block;
          textColor = '#FF7361';
          label = 'Declined';
          break;
        case 'Pending':
          bgColor = '#FFF7EE';
          borderColor = '#FFF0E0';
          icon = Icons.timer;
          textColor = '#FFBE79';
          label = 'Pending';
          break;
        case 'Resolved':
          bgColor = '#EFFDFF';
          borderColor = '#02C5E2';
          icon = Icons.done_all;
          textColor = '#00879B';
          label = 'Resolved';
          break;
      }

      return (
        <View
          style={[styles.statusTag, { backgroundColor: bgColor, borderColor }]}
        >
          <Image
            source={icon}
            style={[styles.statusIcon, { tintColor: textColor }]}
          />
          <Text style={[styles.statusText, { color: textColor }]}>{label}</Text>
        </View>
      );
    };

    return (
      <View style={styles.card}>
        <View style={styles.rowCenter}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          {[item.code, item.client].map((_item, index) => (
            <View key={index} style={styles.badge}>
              <Text style={styles.badgeText}>
                {index === 1 && (
                  <Text style={styles.clientPrefix}>Client: </Text>
                )}
                {_item}
              </Text>
            </View>
          ))}
        </View>

        <Text style={styles.description}>{item.description}</Text>

        <View style={styles.dateBox}>
          <Text style={styles.dateLabel}>Date Initiated: </Text>
          <Text style={styles.dateText}>
            {item.date}, {item.time}
          </Text>
        </View>

        <StatusTag />

        {item.status === 'Pending' && (
          <View style={styles.buttonSection}>
            <Button
              onPress={() =>
                navigate('Success', {
                  type: 'DisputeDeclined',
                  title: 'Dispute',
                  title1: ' Declined',
                })
              }
              title="Decline"
              colors={[Colors.white, Colors.white]}
              textColor={Colors.purple}
              elevation={0}
              shadowOpacity={0}
              borderColor="#D0B3FF"
              width="48%"
            />
            <Button
              onPress={() =>
                navigate('Success', {
                  type: 'DisputeAccepted',
                  title: 'Dispute',
                  title1: ' Approved',
                })
              }
              title="Accept"
              marginTop={normalize(10)}
              width="48%"
            />
          </View>
        )}
      </View>
    );
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={Images.top_shape}
        resizeMode="contain"
        style={styles.topShape}
      />
      <MyStatusBar
        backgroundColor="transparent"
        barStyle="dark-content"
        translucent
      />
      <Header />

      <View style={styles.headerRow}>
        <Text style={styles.dashboardTitle}>
          Dispute <Text style={styles.boldText}>Management</Text>
        </Text>
      </View>

      <View style={styles.contentWrapper}>
        <View style={styles.selectionContainer}>
          {TABS.map(title => {
            const isActive = title === activeTab;
            return (
              <TouchableOpacity
                key={title}
                onPress={() => setActiveTab(title)}
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

        <FlatList
          data={[...filteredData, ...filteredData, ...filteredData]}
          keyExtractor={(item, idx) => `${item.id}-${idx}`}
          renderItem={renderCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.1}
          ListFooterComponent={LoadingFooter}
        />
      </View>
    </View>
  );
};

export default memo(DisputeManagement);
