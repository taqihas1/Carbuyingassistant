import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Linking,
  Share
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import {
  searchCarListings,
  CarListing,
  analyzeDeal,
  getVehicleHistory,
  checkRecalls
} from '../services/carApi';
import AdBanner from '../components/AdBanner';

const { width } = Dimensions.get('window');

export default function CarDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { carId } = route.params as { carId: string };

  const [car, setCar] = useState<CarListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [vehicleHistory, setVehicleHistory] = useState(null);
  const [recalls, setRecalls] = useState([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    loadCarDetails();
  }, [carId]);

  const loadCarDetails = async () => {
    try {
      setLoading(true);
      const listings = await searchCarListings({});
      const foundCar = listings.find((l: any) => l.id === carId);

      if (foundCar) {
        setCar(foundCar);

        // Load additional data in parallel
        const [history, recallData] = await Promise.all([
          getVehicleHistory(foundCar.vin),
          checkRecalls(foundCar.vin)
        ]);

        setVehicleHistory(history);
        setRecalls(recallData);
      }
    } catch (error) {
      console.error('Error loading car details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!car) return;
    try {
      await Share.share({
        message: `Check out this ${car.year} ${car.make} ${car.model} for $${car.price.toLocaleString()}!`,
        url: car.listingUrl
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleCallDealer = () => {
    if (!car) return;
    Linking.openURL(`tel:+1-555-${Math.floor(1000000 + Math.random() * 9000000)}`);
  };

  const handleGetDirections = () => {
    if (!car) return;
    const destination = car.dealerAddress 
      ? `${car.dealerAddress}, ${car.location}` 
      : car.location;
    const url = `https://maps.google.com/?q=${encodeURIComponent(destination)}`;
    Linking.openURL(url);
  };

  const handleViewListing = () => {
    if (!car) return;
    Linking.openURL(car.listingUrl);
  };

  if (loading || !car) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading car details...</Text>
      </View>
    );
  }

  const dealAnalysis = analyzeDeal(car);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Car Details</Text>
          <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
            <Ionicons name="share-outline" size={24} color="#3b82f6" />
          </TouchableOpacity>
        </View>

        {/* Image Gallery */}
        <View style={styles.imageGallery}>
          {car.images.length > 0 ? (
            <>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={(e) => {
                  const index = Math.round(e.nativeEvent.contentOffset.x / width);
                  setActiveImageIndex(index);
                }}
              >
                {car.images.map((image, index) => (
                  <Image key={index} source={{ uri: image }} style={styles.detailImage} resizeMode="cover" />
                ))}
              </ScrollView>
              <View style={styles.imageDots}>
                {car.images.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.dot,
                      activeImageIndex === index ? styles.activeDot : null
                    ]}
                  />
                ))}
              </View>
            </>
          ) : (
            <View style={styles.noImagePlaceholder}>
              <Ionicons name="image" size={48} color="#d1d5db" />
              <Text style={styles.noImageText}>No Photos Available</Text>
              <Text style={styles.noImageSubtext}>Photos from the listing will appear here</Text>
            </View>
          )}
        </View>

        {/* Deal Badge */}
        {dealAnalysis.message && (
          <View style={[styles.dealBanner, { backgroundColor: dealAnalysis.color }]}>
            <Ionicons name={dealAnalysis.icon} size={20} color="#fff" />
            <Text style={styles.dealBannerText}>{dealAnalysis.message}</Text>
          </View>
        )}

        {/* Car Info */}
        <View style={styles.infoSection}>
          <Text style={styles.carTitle}>{car.year} {car.make} {car.model}</Text>
          {car.trim ? <Text style={styles.trimText}>{car.trim}</Text> : null}
          <View style={styles.priceRow}>
            <Text style={styles.price}>${car.price.toLocaleString()}</Text>
            <View style={styles.marketValueBadge}>
              <Text style={styles.marketValueLabel}>Market Value</Text>
              <Text style={styles.marketValue}>
                ${car.originalPrice ? car.originalPrice.toLocaleString() : car.price.toLocaleString()}
              </Text>
            </View>
          </View>
          {car.savings > 0 && (
            <View style={styles.savingsRow}>
              <Text style={styles.originalPrice}>${car.originalPrice.toLocaleString()}</Text>
              <Text style={styles.savingsText}>Save ${car.savings.toLocaleString()} ({car.savingsPercent}%)</Text>
            </View>
          )}
        </View>

        {/* Quick Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Ionicons name="speedometer" size={20} color="#3b82f6" />
            <Text style={styles.statValue}>{car.mileage.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Miles</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="calendar" size={20} color="#3b82f6" />
            <Text style={styles.statValue}>{car.year}</Text>
            <Text style={styles.statLabel}>Year</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="color-palette" size={20} color="#3b82f6" />
            <Text style={styles.statValue}>{car.color}</Text>
            <Text style={styles.statLabel}>Exterior</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="flash" size={20} color="#3b82f6" />
            <Text style={styles.statValue}>{car.fuelType}</Text>
            <Text style={styles.statLabel}>Fuel</Text>
          </View>
        </View>

        {/* Specifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Specifications</Text>
          <View style={styles.specsList}>
            <SpecRow label="VIN" value={car.vin || 'N/A'} />
            <SpecRow label="Condition" value={car.condition} />
            <SpecRow label="Transmission" value={car.transmission} />
            <SpecRow label="Drivetrain" value={car.drivetrain} />
            <SpecRow label="Engine" value={car.engine || 'N/A'} />
            <SpecRow label="Body Type" value={car.bodyType} />
          </View>
        </View>

        {/* Features */}
        {car.features.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Features</Text>
            <View style={styles.featuresGrid}>
              {car.features.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <Ionicons name="checkmark" size={14} color="#166534" />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Price Analysis */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Analysis</Text>
          <View style={styles.specsList}>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>List Price</Text>
              <Text style={styles.specValue}>${car.price.toLocaleString()}</Text>
            </View>
            {car.originalPrice > 0 && (
              <>
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>MSRP / Original</Text>
                  <Text style={[styles.specValue, { textDecorationLine: 'line-through', color: '#9ca3af' }]}>
                    ${car.originalPrice.toLocaleString()}
                  </Text>
                </View>
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>Savings</Text>
                  <Text style={[styles.specValue, { color: '#22c55e', fontWeight: '700' }]}>
                    -${car.savings.toLocaleString()} ({car.savingsPercent}%)
                  </Text>
                </View>
              </>
            )}
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Days on Market</Text>
              <Text style={styles.specValue}>{car.daysOnMarket || 'N/A'} days</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Data Source</Text>
              <Text style={styles.specValue}>MarketCheck API</Text>
            </View>
          </View>
        </View>

        {/* Vehicle History */}
        {vehicleHistory && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Vehicle History</Text>
            <View style={styles.historyGrid}>
              <HistoryItem icon="people" label="Owners" value={vehicleHistory.owners || 'N/A'} status="good" />
              <HistoryItem icon="warning" label="Accidents" value={vehicleHistory.accidents || '0'} status={vehicleHistory.accidents > 0 ? 'warning' : 'good'} />
            </View>
          </View>
        )}

        {/* Recalls */}
        {recalls.length > 0 && (
          <View style={[styles.section, styles.recallSection]}>
            <Text style={[styles.sectionTitle, styles.recallTitle]}>
              <Ionicons name="alert-circle" size={20} color="#ef4444" /> Open Recalls ({recalls.length})
            </Text>
            {recalls.map((recall, index) => (
              <View key={index} style={styles.recallItem}>
                <Text style={styles.recallComponent}>{recall.Component}</Text>
                <Text style={styles.recallSummary}>{recall.Summary}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Dealer Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dealer Information</Text>
          <View style={styles.dealerCard}>
            <View style={styles.dealerHeader}>
              <View style={styles.dealerIcon}>
                <Ionicons name="business" size={24} color="#3b82f6" />
              </View>
              <View style={styles.dealerInfo}>
                <Text style={styles.dealerName}>{car.dealerName}</Text>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={14} color="#f59e0b" />
                  <Text style={styles.dealerRating}>{car.dealerRating || 'N/A'}</Text>
                  <Text style={styles.dealerDistance}> • {car.dealerDistance ? car.dealerDistance.toFixed(1) : '?'} mi away</Text>
                </View>
              </View>
            </View>

            {(car.dealerAddress || car.location) && (
              <View style={styles.dealerLocation}>
                <Ionicons name="location" size={16} color="#6b7280" />
                <View style={{ flex: 1 }}>
                  {car.dealerAddress ? (
                    <Text style={styles.locationText}>{car.dealerAddress}</Text>
                  ) : null}
                  <Text style={[styles.locationText, { color: '#9ca3af', marginTop: 2 }]}>
                    {car.location}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Source */}
        <View style={styles.sourceSection}>
          <Text style={styles.sourceText}>Listed on {car.source}</Text>
          <Text style={styles.daysText}>{car.daysOnMarket} days on market</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleCallDealer}>
            <Ionicons name="call" size={18} color="#fff" />
            <Text style={styles.primaryButtonText}>Call Dealer</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={handleGetDirections}>
            <Ionicons name="navigate" size={18} color="#3b82f6" />
            <Text style={styles.secondaryButtonText}>Directions</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={handleViewListing}>
            <Ionicons name="open-outline" size={18} color="#3b82f6" />
            <Text style={styles.secondaryButtonText}>View Listing</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.specRow}>
      <Text style={styles.specLabel}>{label}</Text>
      <Text style={styles.specValue}>{value}</Text>
    </View>
  );
}

function HistoryItem({ icon, label, value, status }: { icon: string; label: string; value: string; status: string }) {
  const statusColors: any = {
    good: '#22c55e',
    warning: '#f59e0b',
    bad: '#ef4444'
  };

  return (
    <View style={styles.historyItem}>
      <Ionicons name={icon as any} size={24} color={statusColors[status] || '#6b7280'} />
      <Text style={styles.historyValue}>{value}</Text>
      <Text style={styles.historyLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  shareButton: {
    padding: 8,
  },
  imageGallery: {
    position: 'relative',
  },
  detailImage: {
    width: width,
    height: 280,
  },
  imageDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  activeDot: {
    backgroundColor: '#fff',
    width: 24,
  },
  noImagePlaceholder: {
    width: width,
    height: 280,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '600',
  },
  noImageSubtext: {
    marginTop: 4,
    fontSize: 12,
    color: '#9ca3af',
  },
  dealBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  dealBannerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoSection: {
    backgroundColor: '#fff',
    padding: 20,
  },
  carTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  trimText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 4,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 16,
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  savingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  originalPrice: {
    fontSize: 16,
    color: '#9ca3af',
    textDecorationLine: 'line-through',
  },
  savingsText: {
    fontSize: 14,
    color: '#22c55e',
    fontWeight: '600',
  },
  marketValueBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  marketValueLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  marketValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  statsGrid: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 12,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  specsList: {
    gap: 12,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  specLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  specValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  featureText: {
    fontSize: 13,
    color: '#166534',
  },
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  comparisonSource: {
    fontSize: 14,
    color: '#4b5563',
  },
  comparisonPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  bestPrice: {
    color: '#22c55e',
  },
  historyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  historyItem: {
    width: '48%',
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  historyValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 4,
  },
  historyLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  recallSection: {
    backgroundColor: '#fef2f2',
  },
  recallTitle: {
    color: '#ef4444',
  },
  recallItem: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  recallComponent: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ef4444',
  },
  recallSummary: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
  },
  priceHistoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  priceHistoryDate: {
    fontSize: 14,
    color: '#6b7280',
    width: 100,
  },
  priceHistoryPrice: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
    flex: 1,
  },
  priceHistoryChange: {
    fontSize: 13,
    fontWeight: '600',
  },
  priceDrop: {
    color: '#22c55e',
  },
  priceRise: {
    color: '#ef4444',
  },
  dealerCard: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
  },
  dealerHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  dealerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dealerInfo: {
    flex: 1,
  },
  dealerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  dealerRating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400e',
  },
  dealerDistance: {
    fontSize: 13,
    color: '#6b7280',
  },
  dealerLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  locationText: {
    fontSize: 14,
    color: '#4b5563',
  },
  dealerAddress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  addressText: {
    fontSize: 14,
    color: '#4b5563',
  },
  sourceSection: {
    padding: 16,
    alignItems: 'center',
  },
  sourceText: {
    fontSize: 13,
    color: '#9ca3af',
  },
  daysText: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
    backgroundColor: '#fff',
    marginTop: 12,
    paddingBottom: 32,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eff6ff',
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
  },
  secondaryButtonText: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '600',
  },
});
