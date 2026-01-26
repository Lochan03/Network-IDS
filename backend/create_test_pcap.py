from scapy.all import IP, TCP, Ether, wrpcap

def create_pcap(path='test_traffic.pcap'):
    packets = []
    # create 5 simple TCP packets with varying fields
    for i in range(5):
        pkt = Ether()/IP(src=f"10.0.0.{i+1}", dst=f"10.0.1.{i+1}", ttl=64+i)/TCP(sport=1024+i, dport=80+i)
        packets.append(pkt)

    wrpcap(path, packets)
    print(f"Wrote {len(packets)} packets to {path}")

if __name__ == '__main__':
    create_pcap()
