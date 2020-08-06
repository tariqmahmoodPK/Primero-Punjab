require 'rails_helper'

describe Api::V2::KeyPerformanceIndicatorsController, type: :request do
  before(:each) do
    clean_data(Lookup, Location, Agency, Role, UserGroup, User, Child)

    @uk = Location.create!(location_code: 'GBR', name: 'United Kingdom', placename: 'United Kingdom', type: 'Country', hierarchy_path: 'GBR', admin_level: 0)
    @england = Location.create!(location_code: '01', name: 'England', placename: 'England', type: 'Region', hierarchy_path: 'GBR.01', admin_level: 1)
    @london = Location.create!(location_code: '41', name: 'London', placename: 'London', type: 'County', hierarchy_path: 'GBR.01.41', admin_level: 2)

    @unicef = Agency.create!(agency_code: 'UNICEF', name: 'UNICEF')
    @gbv_manager = Role.create!(name: 'GBV Manager', permissions: [
      Permission.new()
    ])
    @primero_gbv_group = UserGroup.create!(name: 'Primero GBV')

    @primero_kpi = User.new(
      user_name: 'primero_kpi',
      agency: @unicef,
      role: @gbv_manager,
      user_groups: [@primero_gbv_group],
      location: @london.location_code
    )
    @primero_kpi.save(validate: false)

    Sunspot.commit
  end

  let(:json) { JSON.parse(response.body, symbolize_names: true) }

  describe 'GET /api/v2/key_performance_indicators/number_of_cases', search: true do
    with 'a valid active case' do
      it "should show one case in the last month in London" do
        child = Child.new_with_user(@primero_kpi, {}).save!
        Sunspot.commit

        sign_in(@primero_kpi)

        get '/api/v2/key_performance_indicators/number_of_cases', params: {
          from: Date.today - 31,
          to: Date.today + 1
        }

        expect(response).to have_http_status(200)
        expect(json[:data][0]).to be
        expect(json[:data][0][:reporting_site]).to eq(@london.placename)
        expect(json[:data][0][json[:dates].last.to_sym]).to eq(1)
      end
    end
  end

  describe 'GET /api/v2/key_performance_indicators/number_of_incidents', search: true do
    with 'a valid incident dated 6 days ago' do
      it "shows 1 incident in the last month in London" do
        incident = Incident.new_with_user(@primero_kpi, {
          incident_date: Date.today.prev_day(6)
        }).save!
        Sunspot.commit

        sign_in(@primero_kpi)

        get '/api/v2/key_performance_indicators/number_of_incidents', params: {
          from: Date.today - 31,
          to: Date.today + 1
        }

        expect(response).to have_http_status(200)
        expect(json[:data][0]).to be
        expect(json[:data][0][:reporting_site]).to eq(@london.placename)
        expect(json[:data][0][json[:dates].last.to_sym]).to eq(1)
      end
    end
  end

  describe 'GET /api/v2/key_performance_indicators/reporting_delay', search: true do
    with 'a valid incident dated 6 days ago' do
      it 'shows 1 incident in the 6-14days range' do
        incident = Incident.new_with_user(@primero_kpi, {
          incident_date: Date.today.prev_day(6)
        }).save!
        Sunspot.commit

        sign_in(@primero_kpi)

        get '/api/v2/key_performance_indicators/reporting_delay', params: {
          from: Date.today - 31,
          to: Date.today + 1
        }

        expect(response).to have_http_status(200)
        expect(json[:data]).to be
        result = json[:data].
          select { |result| result[:total_incidents] > 0 }.
          first

        expect(result[:delay]).to eql('6-14days')
        expect(result[:total_incidents]).to eql(1)
        expect(result[:percentage]).to eql(1.0)
      end
    end
  end

  describe 'GET /api/v2/key_performance_indicators/assessment_status', search: true do
    with '1 case with a filled out survivor assessment form' do
      it 'shows an asssessment status of 100%' do
        child = Child.new_with_user(@primero_kpi, {
          "survivor_assessment_form" => [{
            'assessment_emotional_state_start' => 'Overwhelmed',
            'assessment_emotional_state_end' => 'Resilient',
            'assessment_presenting_problem' => 'Anxiety',
            'assessment_main_concerns' => 'Poor sales',
            'assessment_current_situation' => 'Poor'
          }]
        }).save!
        Sunspot.commit

        sign_in(@primero_kpi)

        get '/api/v2/key_performance_indicators/assessment_status', params: {
          from: Date.today - 31,
          to: Date.today + 1
        }

        expect(response).to have_http_status(200)
        expect(json[:data][:completed]).to eql(1.0)
      end
    end
  end

  describe 'GET /api/v2/key_performance_indicators/completed_case_safety_plans', search: true do
    with '1 case with a filled out case safety plan' do
      it 'shows safety plan completed status of 100%' do
        child = Child.new_with_user(@primero_kpi, {
          "safety_plan" => [{
            'safety_plan_needed' => 'yes',
            'safety_plan_developed_with_survivor' => 'yes',
            'safety_plan_completion_date' => Date.today,
            'safety_plan_main_concern' => 'covid-19',
            'safety_plan_preparedness_signal' => 'Firing workers',
            'safety_plan_preparedness_gathered_things' => 'Ill prespared'
          }]
        }).save!
        Sunspot.commit

        sign_in(@primero_kpi)

        get '/api/v2/key_performance_indicators/completed_case_safety_plans', params: {
          from: Date.today - 31,
          to: Date.today + 1
        }

        expect(response).to have_http_status(200)
        expect(json[:data][:completed]).to eql(1.0)
      end
    end
  end

  describe 'GET /api/v2/key_performance_indicators/completed_case_action_plans', search: true do
    with '1 case with a filled out case action plan' do
      it 'shows safety plan completed status of 100%' do
        child = Child.new_with_user(@primero_kpi, {
          "action_plan" => [{
            'service_type' => 'fiscal',
            'service_referral' => 'advice',
            'service_referral_written_consent' => 'yes'
          }]
        }).save!
        Sunspot.commit

        sign_in(@primero_kpi)

        get '/api/v2/key_performance_indicators/completed_case_action_plans', params: {
          from: Date.today - 31,
          to: Date.today + 1
        }

        expect(response).to have_http_status(200)
        expect(json[:data][:completed]).to eql(1.0)
      end
    end
  end

  describe 'GET /api/v2/key_performance_indicators/completed_supervisor_approved_case_action_plans', search: true do
    skip
  end

  describe 'GET /api/v2/key_performance_indicators/services_provided', search: true do
    with 'service-type lookups and a case with a service_type_provided' do
      it 'it returns a list of 1 service and a count of the times it was provided' do
        Lookup.create!({
          :unique_id => "lookup-service-type",
          :name_en => "Service Type",
          :lookup_values_en => [
            {id: "safehouse_service", display_text: "Safehouse Service"}.with_indifferent_access
          ]
        })
        child = Child.new_with_user(@primero_kpi, {
          "action_plan" => [{
            "gbv_follow_up_subform_section" => [{
              "service_type_provided" => "safehouse_service"
            }]
          }]
        }).save!
        Sunspot.commit

        sign_in(@primero_kpi)

        get '/api/v2/key_performance_indicators/services_provided', params: {
          from: Date.today - 31,
          to: Date.today + 1
        }

        expect(response).to have_http_status(200)
        expect(json[:data][:services_provided].length).to eql(1)
      end
    end
  end

  describe 'GET /api/v2/key_performance_indicators/average_referrals', search: true do
    with 'a single case that has been referred once' do
      it 'should return an average referral rate of 1.0' do
        chidl = Child.new_with_user(@primero_kpi, {
          'action_plan' => [{
            'action_plan_subform_section' => [{
              'service_referral' => 'Referred'
            }]
          }]
        }).save!
        Sunspot.commit

        sign_in(@primero_kpi)

        get '/api/v2/key_performance_indicators/average_referrals', params: {
          from: Date.today - 31,
          to: Date.today + 1
        }

        expect(response).to have_http_status(200)
        expect(json[:data][:average_referrals]).to eql(1.0)
      end
    end
  end

end
